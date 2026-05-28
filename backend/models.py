from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from database import Base


# register user
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100),nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("admin","manager","employee"), nullable=False)
    
    managed_profiles = relationship("OnboardingProfile", back_populates="manager", foreign_keys="OnboardingProfile.manager_id")
    
    employee_profiles = relationship("OnboardingProfile",back_populates="employee",foreign_keys="OnboardingProfile.employee_id")
    
    assigned_tasks   = relationship("Task", back_populates="assigned_user")
    
    

# onboarded
class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String(200), nullable=False)
    joining_date = Column(Date, nullable=False)
    
    
    employee = relationship("User", back_populates="employee_profiles", foreign_keys=[employee_id])
    manager  = relationship("User", back_populates="managed_profiles", foreign_keys=[manager_id])
    tasks    = relationship("Task", back_populates="profile")
    
    

# task for everyone (must) 
class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"

    id    = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)

    template_tasks = relationship("TemplateTask", back_populates="template")



# list of tasks, common task according to the role
class TemplateTask(Base):
    __tablename__ = "template_tasks"

    id          = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("checklist_templates.id"), nullable=False)
    title       = Column(String(200), nullable=False)

    template = relationship("ChecklistTemplate", back_populates="template_tasks")



# assigned task
class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    profile_id  = Column(Integer, ForeignKey("onboarding_profiles.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    title       = Column(String(200), nullable=False)
    status      = Column(Enum("pending", "in_progress", "completed"),
                         default="pending", nullable=False)

    profile       = relationship("OnboardingProfile", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks")
    
    
