from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import OnboardingProfile,Task, User
from schemas.profile import ProfileCreate,ProfileResponse,ProfileDetailResponse
from utils.auth_deps import get_current_user, require_manager
from models import ChecklistTemplate, TemplateTask


router = APIRouter(prefix="/profiles",tags=["Profiles"])

# get/profiles/
# profiles filtered by role

@router.get("/",response_model=list[ProfileResponse])
def get_profiles(db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # admin can see all profiles
    if current_user.role == "admin":
        profiles = db.query(OnboardingProfile).all()
    
    # Manager sees profiles assigned to them.
    elif current_user.role == "manager":
        profiles = db.query(OnboardingProfile).filter(OnboardingProfile.manager_id==current_user.id).all()
        
    else:
        # employee can see their profile only 
        profiles = db.query(OnboardingProfile).filter(OnboardingProfile.employee_id==current_user.id).all()
        
        
        
    # calculate task completion for each profile
    result = []
    for profile in profiles:
        tasks = db.query(Task).filter(Task.profile_id==profile.id).all()
        total = len(tasks)
        completed = len([t for t in tasks if t.status=="completed"])
        percentage = (completed/total *100) if total>0 else 0.0
        
        profile_data = ProfileResponse(
            id= profile.id,
            employee_id=profile.employee_id,
            employee_name=profile.employee.name if profile.employee else None,
            manager_id=profile.manager_id,
            manager_name=profile.manager.name if profile.manager else None,
            department=profile.department,
            joining_date=profile.joining_date,
            completion_percentage= round(percentage,2)
        )
        result.append(profile_data)
        
    return result


# post/profiles/
# create a new profile

@router.post("/", response_model=ProfileResponse, status_code=201)
def create_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)  # admin or manager only
):
    new_profile = OnboardingProfile(
        employee_id=profile_data.employee_id,
        manager_id=profile_data.manager_id,
        department=profile_data.department,
        joining_date=profile_data.joining_date
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return ProfileResponse(
        id=new_profile.id,
        employee_id=new_profile.employee_id,
        employee_name=new_profile.employee.name if new_profile.employee else None,
        manager_id=new_profile.manager_id,
        manager_name=new_profile.manager.name if new_profile.manager else None,
        department=new_profile.department,
        joining_date=new_profile.joining_date,
        completion_percentage=0.0
    )
    
    
    
#get/profiles/{id} 
# get a profile with its full task list
@router.get("/{profile_id}", response_model=ProfileDetailResponse)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.id == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # employee can only see their own profile 
    # trying to access another employee's id get error
    if current_user.role == "employee" and profile.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # manager can only see their own profiles
    # manager tryig to access profile not assigned to them
    if current_user.role == "manager" and profile.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    tasks = db.query(Task).filter(Task.profile_id == profile.id).all()
    total = len(tasks)
    completed = len([t for t in tasks if t.status == "completed"])
    percentage = (completed / total * 100) if total > 0 else 0.0

    return ProfileDetailResponse(
        id=profile.id,
        employee_id=profile.employee_id,
        employee_name=profile.employee.name if profile.employee else None,
        manager_id=profile.manager_id,
        manager_name=profile.manager.name if profile.manager else None,
        department=profile.department,
        joining_date=profile.joining_date,
        completion_percentage=round(percentage, 2),
        tasks=tasks
    )

    
    
#post/profiles/{id}/assign-template
# copy template task into a profile
@router.post("/{profile_id}/assign-template", status_code=201)
def assign_template(
    profile_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    template = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == body.get("template_id")).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    
    # copy
    template_tasks = db.query(TemplateTask).filter(TemplateTask.template_id == template.id).all()

    for tt in template_tasks:
        new_task = Task(
            profile_id=profile_id,
            title=tt.title,
            status="pending"
        )
        db.add(new_task)

    db.commit()
    return {"message": f"{len(template_tasks)} tasks copied to profile"}


# post/profiles/{id}/tasks 
# add ad-hoc task 
@router.post("/{profile_id}/tasks", status_code=201)
def add_task(
    profile_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    new_task = Task(
        profile_id=profile_id,
        title=body.get("title"),
        status="pending",
        assigned_to=body.get("assigned_to", None)
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {"message": "Task added", "task_id": new_task.id}
