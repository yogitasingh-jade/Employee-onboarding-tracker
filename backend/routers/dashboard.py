from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import OnboardingProfile, Task, User
from utils.auth_deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# get/dashboard/summary 
# role based stats 
@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    # for admin
    if current_user.role == "admin":
        # Total profiles and average completion
        profiles = db.query(OnboardingProfile).all()
        total_profiles = len(profiles)
        percentages = []

        for profile in profiles:
            tasks = db.query(Task).filter(Task.profile_id == profile.id).all()
            total = len(tasks)
            completed = len([t for t in tasks if t.status == "completed"])
            pct = (completed / total * 100) if total > 0 else 0.0
            percentages.append(pct)

        avg = round(sum(percentages) / len(percentages), 2) if percentages else 0.0

        return {
            "role": "admin",
            "total_active_profiles": total_profiles,
            "average_completion_percentage": avg
        }
        
    # for manager
    elif current_user.role == "manager":
        # Manager sees their new hires with progress
        profiles = db.query(OnboardingProfile).filter(OnboardingProfile.manager_id == current_user.id).all()

        result = []
        for profile in profiles:
            tasks = db.query(Task).filter(Task.profile_id == profile.id).all()
            total = len(tasks)
            completed = len([t for t in tasks if t.status == "completed"])
            pct = (completed / total * 100) if total > 0 else 0.0
            result.append({
                "profile_id": profile.id,
                "employee_id": profile.employee_id,
                "employee_name": profile.employee.name if profile.employee else None,
                "department": profile.department,
                "completion_percentage": round(pct, 2)
            })

        return {
            "role": "manager",
            "new_hires": result
        }
    
    # for employee
    else:
        # Employee sees their own tasks grouped by status
        profile = db.query(OnboardingProfile).filter(OnboardingProfile.employee_id == current_user.id).first()

        if not profile:
            return {"role": "employee", "message": "No profile assigned yet"}

        tasks = db.query(Task).filter(Task.profile_id == profile.id).all()

        return {
            "role": "employee",
            "pending": [
                {"id": t.id, "title": t.title, "status": t.status}
                for t in tasks if t.status == "pending"
            ],
            "in_progress": [
                {"id": t.id, "title": t.title, "status": t.status}
                for t in tasks if t.status == "in_progress"
            ],
            "completed": [
                {"id": t.id, "title": t.title, "status": t.status}
                for t in tasks if t.status == "completed"
            ]
        }
