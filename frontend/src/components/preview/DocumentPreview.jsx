import React from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Box, IconButton, Dialog, Slide, AppBar, Toolbar, Typography } from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DocumentPreview({ open, onClose, file, downloadUrl }) {
  const { theme } = useTheme();

  if (!file) return null;

  const docs = [
    { 
        uri: downloadUrl, 
        fileName: file.fileName,
        fileType: file.mimeType
    }
  ];

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a', // Dark background for better reading focus
        }
      }}
    >
      <AppBar sx={{ position: 'relative', bgcolor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {file.fileName}
          </Typography>
          <IconButton color="inherit" onClick={() => window.open(downloadUrl, '_blank')}>
            <Download />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        flex: 1, 
        height: 'calc(100vh - 64px)', 
        overflow: 'hidden',
        '& .react-doc-viewer': {
            height: '100% !important',
        },
        '& #proxy-renderer': {
            height: '100%',
            overflow: 'auto'
        }
      }}>
        <DocViewer 
            documents={docs} 
            pluginRenderers={DocViewerRenderers}
            style={{ height: '100%', background: 'transparent' }}
            theme={{
                primary: theme.palette.primary.main,
                secondary: '#ffffff',
                tertiary: 'rgba(255,255,255,0.1)',
                text_primary: '#ffffff',
                text_secondary: '#aaaaaa',
                text_tertiary: '#777777',
                disableThemeScrollbar: false,
            }}
            config={{
                header: {
                    disableHeader: true,
                    disableFileName: true,
                    retainURLParams: false
                }
            }}
        />
      </Box>
    </Dialog>
  );
}

export default DocumentPreview;
