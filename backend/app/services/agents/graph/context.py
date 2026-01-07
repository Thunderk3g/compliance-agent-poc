import contextvars
from typing import Optional, Any

class GraphContext:
    """
    Context Manager to pass the DB Session through the LangGraph nodes.
    This avoids passing 'db' as a state argument which can't be pickled easily.
    """
    _db_session: contextvars.ContextVar[Optional[Any]] = contextvars.ContextVar("db_session", default=None)

    @classmethod
    def set_db_session(cls, session: Any):
        return cls._db_session.set(session)

    @classmethod
    def get_db_session(cls) -> Optional[Any]:
        return cls._db_session.get()
        
    @classmethod
    def reset_db_session(cls, token):
        cls._db_session.reset(token)
