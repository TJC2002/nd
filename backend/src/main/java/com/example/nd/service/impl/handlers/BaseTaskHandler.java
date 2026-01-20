package com.example.nd.service.impl.handlers;

import com.example.nd.model.AsyncTask;
import com.example.nd.service.TaskHandler;
import com.example.nd.service.TaskManagerService;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class BaseTaskHandler implements TaskHandler {

    @Autowired
    protected TaskManagerService taskManagerService;

    protected volatile boolean isCancelled = false;
    protected volatile boolean isPaused = false;

    @Override
    public void cancelTask(AsyncTask task) {
        isCancelled = true;
        isPaused = false;
    }

    @Override
    public void pauseTask(AsyncTask task) {
        isPaused = true;
    }

    @Override
    public void resumeTask(AsyncTask task) {
        isPaused = false;
        synchronized (this) {
            notifyAll();
        }
    }

    @Override
    public int getProgress(AsyncTask task) {
        return task.getProgress();
    }

    protected void updateProgress(AsyncTask task, int progress, String message) {
        if (isCancelled) {
            return;
        }
        taskManagerService.updateTaskProgress(task.getId(), progress, message);
    }

    protected void checkPause() throws InterruptedException {
        while (isPaused && !isCancelled) {
            synchronized (this) {
                wait(1000);
            }
        }
        if (isCancelled) {
            throw new InterruptedException("Task was cancelled");
        }
    }

    protected boolean isTaskCancelled() {
        return isCancelled;
    }

    protected void completeTask(AsyncTask task, String resultData) {
        taskManagerService.completeTask(task.getId(), resultData);
    }

    protected void failTask(AsyncTask task, String errorDetails) {
        taskManagerService.failTask(task.getId(), errorDetails);
    }
}
