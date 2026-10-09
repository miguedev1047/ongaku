use thiserror::Error;

#[derive(Error, Debug)]
pub enum ServiceError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("Database pool error: {0}")]
    Pool(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Conflict / already exists: {0}")]
    Conflict(String),

    #[error("{0}")]
    Execution(String),
}

impl From<String> for ServiceError {
    fn from(err: String) -> Self {
        ServiceError::Execution(err)
    }
}

impl From<&str> for ServiceError {
    fn from(err: &str) -> Self {
        ServiceError::Execution(err.to_string())
    }
}
