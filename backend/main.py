from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, profiles, templates, tasks, dashboard

# Creates all tables in MySQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Onboarding Tracker")


# middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(templates.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)



@app.get("/")
def root():
    return {"message": "Onboarding Tracker API is running!"}