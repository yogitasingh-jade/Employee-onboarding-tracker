from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ChecklistTemplate, TemplateTask
from utils.auth_deps import get_current_user, require_admin
from models import User

router = APIRouter(prefix="/templates", tags=["Templates"])


# get/templates/
# list all templates
@router.get("/")
def get_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    templates = db.query(ChecklistTemplate).all()
    result = []
    for t in templates:
        task_titles = [tt.title for tt in t.template_tasks]
        result.append({
            "id": t.id,
            "title": t.title,
            "task_titles": task_titles
        })
    return result


# post/templates/ 
# create template -> only admin can do this
@router.post("/", status_code=201)
def create_template(
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  
):
    title = body.get("title")
    task_titles = body.get("task_titles", [])

    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    # Create the template
    new_template = ChecklistTemplate(title=title)
    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    # Create each task inside the template
    for task_title in task_titles:
        task = TemplateTask(
            template_id=new_template.id,
            title=task_title
        )
        db.add(task)

    db.commit()

    return {
        "id": new_template.id,
        "title": new_template.title,
        "task_titles": task_titles
    }