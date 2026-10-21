use serde::Serialize;

#[derive(Serialize, Clone, Debug, PartialEq)]
pub struct DownloadProgress {
    pub id: String,
    pub progress: f64,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub done: bool,
}
