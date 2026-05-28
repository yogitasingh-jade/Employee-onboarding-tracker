from pydantic import BaseModel
from typing import Optional, List


# create new task
class TaskCreate(BaseModel):
    title:str
    assigned_to:Optional[int]=None
    
    
# update task
class TaskUpdate(BaseModel):
    status:Optional[str] = None
    assigned_to:Optional[int]=None



# return task data
class TaskResponse(BaseModel):
    id:int
    profile_id:int
    title:str
    status:str
    assigned_to:Optional[int]=None
    
    class Config:
        from_attributes = True  
        

# create template task
class TemplateCreate(BaseModel):
    title:str
    task_title:List[str]
    


# return template data
class TemplateResponse(BaseModel):
    id:int
    title:str
    task_titles:List[str] = []
    
    class Config:
        from_attributes = True  
        

