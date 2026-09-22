use std::path::{Path, PathBuf};

pub enum ResolveError {
    NotFound,
    OutsideRoot,
}

pub fn resolve_inside(root: &Path, requested: &str) -> Result<PathBuf, ResolveError> {
    let root = root.canonicalize().map_err(|_| ResolveError::NotFound)?;
    let full = root
        .join(requested)
        .canonicalize()
        .map_err(|_| ResolveError::NotFound)?;

    if !full.starts_with(&root) {
        return Err(ResolveError::OutsideRoot);
    }
    if !full.is_file() {
        return Err(ResolveError::NotFound);
    }

    Ok(full)
}
