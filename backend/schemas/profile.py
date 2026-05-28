from pydantic import BaseModel
from datetime import date
from typing import Optional, List


# create profile
class ProfileCreate(BaseModel):
    employee_id: int
    manager_id: int
    department:str
    joining_date: date
    
    

# response profile
class ProfileResponse(BaseModel):
    id:int
    employee_id:int
    manager_id:int
    department:str
    joining_date:date
    completion_percentage:Optional[float] = 0.0
    
    class Config:
        from_attributes = True  
        
        

#  list of task
class TaskInProfile(BaseModel):
    id:int
    title:str
    assigned_to:Optional[int] = None
    
    class Config:
        from_attributes = True  
        
        
# task assign to employee by manager 
class ProfileDetailResponse(BaseModel):
    id:int
    employee_id:int
    manager_id:int
    department:str
    joining_date:date
    completion_percentage:Optional[float] = 0.0
    tasks:List[TaskInProfile] = []
    
    class Config:
        from_attributes = True  
    
    