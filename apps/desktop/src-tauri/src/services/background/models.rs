use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundItem {
    pub id: String,
    pub file_name: String,
    pub created_at: u64,
    pub size: u64,
}
