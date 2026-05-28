from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Task, User
from schemas.task import TaskUpdate, TaskResponse
from utils.auth_deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# put/tasks/{id} 
# update status or assignee 
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Employees can update tasks assigned to them or tasks on their own profile.
    if (
        current_user.role == "employee"
        and task.assigned_to != current_user.id
        and task.profile.employee_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="You can only update your own tasks")

    # status value
    valid_statuses = ["pending", "in_progress", "completed"]
    if task_data.status and task_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status value")

    # Update only the fields that were sent
    if task_data.status is not None:
        task.status = task_data.status
    if task_data.assigned_to is not None:
        task.assigned_to = task_data.assigned_to

    db.commit()
    db.refresh(task)
    return task
