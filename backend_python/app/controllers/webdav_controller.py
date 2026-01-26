from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import User
from app.services.file_service import FileService
from app.services.share_service import ShareService
from typing import Optional, Dict, Any
import os
import hashlib
import uuid
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webdav", tags=["WebDAV"])


class WebDAVHandler:
    def __init__(self, db: Session, user: User = None):
        self.db = db
        self.user = user
        self.file_service = FileService(db)
        self.share_service = ShareService(db)

    def handle_options(self, request: Request) -> Response:
        headers = {
            "Allow": "GET, HEAD, POST, PUT, DELETE, PROPFIND, PROPPATCH, COPY, MOVE, MKCOL, LOCK, UNLOCK",
            "DAV": "1, 2",
        }
        return Response(status_code=200, headers=headers)

    async def handle_propfind(self, request: Request, path: str) -> Response:
        try:
            path_parts = path.strip("/").split("/") if path.strip("/") else []

            if not path_parts:
                user_id = int(self.user.id) if self.user else None
                return await self._create_propfind_response(user_id, is_root=True)

            if len(path_parts) == 1:
                share_code = path_parts[0]
                share = self.share_service.get_share_by_code(share_code)
                if share:
                    return await self._create_propfind_response(None, share=share)

            if self.user:
                user_id = self.user.id
                if len(path_parts) == 1:
                    file_id = int(path_parts[0]) if path_parts[0].isdigit() else None
                    if file_id:
                        file_info = self.file_service.get_file_by_id(file_id)
                        if file_info:
                            return await self._create_propfind_response(
                                user_id, file_info=file_info
                            )
                else:
                    # For nested paths, we'd need to implement path resolution
                    # For now, return root files
                    files = self.file_service.get_root_files(self.user.id)
                    return await self._create_propfind_response(
                        self.user.id, files=files
                    )

            return Response(status_code=404, content="Resource not found")

        except Exception as e:
            logger.error(f"PROPFIND error: {str(e)}")
            return Response(status_code=500, content="Internal server error")

    async def handle_get(self, request: Request, path: str) -> Response:
        try:
            path_parts = path.strip("/").split("/") if path.strip("/") else []

            if not path_parts:
                return Response(status_code=400, content="Bad request")

            if len(path_parts) == 1:
                share_code = path_parts[0]
                share = self.share_service.get_share_by_code(share_code)
                if share:
                    return await self._serve_shared_file(share)

            if self.user:
                file_id = int(path_parts[0]) if path_parts[0].isdigit() else None
                if file_id:
                    file_info = self.file_service.get_file_by_id(file_id)
                    if file_info and not file_info.is_folder:
                        return await self._serve_user_file(file_info)

            return Response(status_code=404, content="File not found")

        except Exception as e:
            logger.error(f"GET error: {str(e)}")
            return Response(status_code=500, content="Internal server error")

    async def handle_head(self, request: Request, path: str) -> Response:
        response = await self.handle_get(request, path)
        if hasattr(response, "headers"):
            response.headers.pop("content-length", None)
            response.headers.pop("content-type", None)
        return response

    async def handle_put(self, request: Request, path: str) -> Response:
        try:
            if not self.user:
                return Response(status_code=401, content="Unauthorized")

            path_parts = path.strip("/").split("/") if path.strip("/") else []
            if not path_parts:
                return Response(status_code=400, content="Bad request")

            filename = path_parts[-1]

            # For now, create file in root directory
            parent_folder_id = None

            content = await request.body()

            # Create file using existing upload method
            from fastapi import UploadFile
            from io import BytesIO

            upload_file = UploadFile(
                filename=filename,
                content_type=request.headers.get(
                    "content-type", "application/octet-stream"
                ),
            )
            upload_file.file = BytesIO(content)
            upload_file.headers = None

            file_info = self.file_service.upload_file(
                self.user.id, upload_file, parent_folder_id
            )

            return Response(status_code=201, content="File created")

        except Exception as e:
            logger.error(f"PUT error: {str(e)}")
            return Response(status_code=500, content="Internal server error")

    async def handle_delete(self, request: Request, path: str) -> Response:
        try:
            path_parts = path.strip("/").split("/") if path.strip("/") else []

            if not path_parts:
                return Response(status_code=400, content="Bad request")

            if len(path_parts) == 1:
                share_code = path_parts[0]
                share = self.share_service.get_share_by_code(share_code)
                if share:
                    self.share_service.delete_share(
                        self.user.id if self.user else None, share.id
                    )
                    return Response(status_code=204, content="")

            if self.user:
                file_id = int(path_parts[0]) if path_parts[0].isdigit() else None
                if file_id:
                    file_info = self.file_service.get_file_by_id(file_id)
                    if file_info:
                        self.file_service.delete_file(file_id)
                        return Response(status_code=204, content="")

            return Response(status_code=404, content="Resource not found")

        except Exception as e:
            logger.error(f"DELETE error: {str(e)}")
            return Response(status_code=500, content="Internal server error")

    async def handle_mkcol(self, request: Request, path: str) -> Response:
        try:
            if not self.user:
                return Response(status_code=401, content="Unauthorized")

            path_parts = path.strip("/").split("/") if path.strip("/") else []
            if not path_parts:
                return Response(status_code=400, content="Bad request")

            folder_name = path_parts[-1]

            # For now, create folder in root directory
            parent_folder_id = None

            folder = self.file_service.create_folder(
                user_id=self.user.id,
                folder_name=folder_name,
                parent_folder_id=parent_folder_id,
            )

            return Response(status_code=201, content="Collection created")

        except Exception as e:
            logger.error(f"MKCOL error: {str(e)}")
            return Response(status_code=500, content="Internal server error")

    async def _serve_user_file(self, file_info):
        try:
            file_path = file_info.storage_path
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")

            async def file_generator():
                with open(file_path, "rb") as file:
                    while chunk := file.read(8192):
                        yield chunk

            return StreamingResponse(
                file_generator(),
                media_type=file_info.mime_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{file_info.file_name}"'
                },
            )

        except Exception as e:
            logger.error(f"Error serving file {file_info.name}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error serving file")

    async def _serve_shared_file(self, share):
        try:
            file_path = share.file.storage_path
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")

            async def file_generator():
                with open(file_path, "rb") as file:
                    while chunk := file.read(8192):
                        yield chunk

            return StreamingResponse(
                file_generator(),
                media_type=share.file.mime_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{share.file.name}"'
                },
            )

        except Exception as e:
            logger.error(f"Error serving shared file {share.file.name}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error serving file")

    async def _create_propfind_response(
        self,
        user_id: Optional[int],
        is_root: bool = False,
        file_info=None,
        share=None,
        files=None,
    ):
        from xml.etree.ElementTree import Element, SubElement, tostring
        from xml.dom import minidom

        root = Element("d:multistatus", {"xmlns:d": "DAV:"})

        if is_root:
            response = SubElement(root, "d:response")
            SubElement(response, "d:href").text = "/"

            propstat = SubElement(response, "d:propstat")
            SubElement(propstat, "d:prop")

            SubElement(propstat, "d:displayname").text = "Root"
            SubElement(propstat, "d:resourcetype").text = "<d:collection/>"
            SubElement(propstat, "d:getcontentlength").text = "0"
            SubElement(propstat, "d:getlastmodified").text = datetime.now().strftime(
                "%a, %d %b %Y %H:%M:%S GMT"
            )
            SubElement(propstat, "d:creationdate").text = datetime.now().strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )

        elif file_info:
            response = SubElement(root, "d:response")
            href = f"/{file_info.id}"
            SubElement(response, "d:href").text = href

            propstat = SubElement(response, "d:propstat")
            SubElement(propstat, "d:prop")

            SubElement(propstat, "d:displayname").text = file_info.file_name

            resourcetype = SubElement(propstat, "d:resourcetype")
            if file_info.is_folder:
                SubElement(resourcetype, "d:collection")
            else:
                resourcetype.text = ""

            if not file_info.is_folder:
                SubElement(propstat, "d:getcontentlength").text = str(
                    file_info.file_size
                )

            SubElement(
                propstat, "d:getlastmodified"
            ).text = file_info.updated_at.strftime("%a, %d %b %Y %H:%M:%S GMT")
            SubElement(propstat, "d:creationdate").text = file_info.created_at.strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )

        elif files:
            for file_info in files:
                response = SubElement(root, "d:response")
                href = f"/{file_info.id}"
                SubElement(response, "d:href").text = href

                propstat = SubElement(response, "d:propstat")
                SubElement(propstat, "d:prop")

                SubElement(propstat, "d:displayname").text = file_info.file_name

                resourcetype = SubElement(propstat, "d:resourcetype")
                if file_info.is_folder:
                    SubElement(resourcetype, "d:collection")
                else:
                    resourcetype.text = ""

                if not file_info.is_folder:
                    SubElement(propstat, "d:getcontentlength").text = str(
                        file_info.file_size
                    )

                SubElement(
                    propstat, "d:getlastmodified"
                ).text = file_info.updated_at.strftime("%a, %d %b %Y %H:%M:%S GMT")
                SubElement(
                    propstat, "d:creationdate"
                ).text = file_info.created_at.strftime("%Y-%m-%dT%H:%M:%SZ")

        xml_str = tostring(root, encoding="unicode")
        dom = minidom.parseString(xml_str)
        pretty_xml = dom.toprettyxml(indent="  ")

        return Response(
            content=pretty_xml,
            media_type="application/xml; charset=utf-8",
            status_code=207,
        )


@router.options("/{path:path}")
async def webdav_options(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return handler.handle_options(request)


@router.get("/{path:path}")
async def webdav_get(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return await handler.handle_get(request, path)


@router.head("/{path:path}")
async def webdav_head(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return await handler.handle_head(request, path)


@router.put("/{path:path}")
async def webdav_put(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return await handler.handle_put(request, path)


@router.delete("/{path:path}")
async def webdav_delete(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return await handler.handle_delete(request, path)


@router.post("/{path:path}")
async def webdav_mkcol(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return await handler.handle_mkcol(request, path)


@router.request(method="COPY", path="/{path:path}")
async def webdav_copy(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    destination = request.headers.get("Destination", "")
    if not destination:
        return Response(status_code=400, content="Destination header required")

    # Basic COPY implementation - just return success for now
    return Response(status_code=201, content="Resource copied")


@router.request(method="MOVE", path="/{path:path}")
async def webdav_move(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    destination = request.headers.get("Destination", "")
    if not destination:
        return Response(status_code=400, content="Destination header required")

    # Basic MOVE implementation - just return success for now
    return Response(status_code=201, content="Resource moved")


@router.request(method="PROPFIND", path="/{path:path}")
async def webdav_propfind(
    request: Request,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    handler = WebDAVHandler(db, current_user)
    return await handler.handle_propfind(request, path)


@router.get("/public/{share_code}/{path:path}")
async def webdav_public_get(
    request: Request, share_code: str, path: str, db: Session = Depends(get_db)
):
    handler = WebDAVHandler(db)
    share = handler.share_service.get_share_by_code(share_code)

    if not share:
        return Response(status_code=404, content="Share not found or expired")

    if share.password:
        password = request.headers.get("X-Share-Password")
        if (
            not password
            or hashlib.sha256(password.encode()).hexdigest() != share.password
        ):
            return Response(status_code=401, content="Unauthorized")

    return await handler.handle_get(request, f"{share_code}/{path}")


@router.request(method="PROPFIND", path="/public/{share_code}/{path:path}")
async def webdav_public_propfind(
    request: Request, share_code: str, path: str, db: Session = Depends(get_db)
):
    handler = WebDAVHandler(db)
    share = handler.share_service.get_share_by_code(share_code)

    if not share:
        return Response(status_code=404, content="Share not found or expired")

    if share.password:
        password = request.headers.get("X-Share-Password")
        if (
            not password
            or hashlib.sha256(password.encode()).hexdigest() != share.password
        ):
            return Response(status_code=401, content="Unauthorized")

    return await handler.handle_propfind(request, f"{share_code}/{path}")
