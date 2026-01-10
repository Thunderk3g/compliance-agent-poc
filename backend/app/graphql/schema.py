import strawberry
import uuid
from typing import List, Optional
from .resolvers import Resolvers

@strawberry.type
class ProjectType:
    id: uuid.UUID
    name: str
    description: Optional[str]

@strawberry.type
class SubmissionType:
    id: uuid.UUID
    filename: str
    status: str
    project_id: Optional[uuid.UUID]

@strawberry.type
class RuleType:
    id: uuid.UUID
    title: str
    category: str
    severity: str
    is_active: bool

@strawberry.type
class Query:
    projects: List[ProjectType] = strawberry.field(resolver=Resolvers.get_projects)
    project: Optional[ProjectType] = strawberry.field(resolver=Resolvers.get_project)
    submissions: List[SubmissionType] = strawberry.field(resolver=Resolvers.get_submissions)
    rules: List[RuleType] = strawberry.field(resolver=Resolvers.get_rules)
    
@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_project(self, name: str, description: Optional[str] = None) -> ProjectType:
        return Resolvers.create_project(None, name, description)

    @strawberry.mutation
    def delete_project(self, id: uuid.UUID) -> bool:
        return Resolvers.delete_project(None, id)

schema = strawberry.Schema(query=Query, mutation=Mutation)
