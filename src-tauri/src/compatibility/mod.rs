#[cfg(target_os = "linux")]
mod linux;
#[cfg(not(target_os = "linux"))]
mod noop;

#[cfg(target_os = "linux")]
pub use linux::*;
#[cfg(not(target_os = "linux"))]
pub use noop::*;
