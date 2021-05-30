use std::{env, fs, path::PathBuf};

const API_PATH: &str = "../../libs/api/src/lib/";

fn main() {
	let proto_path = String::from(API_PATH) + "proto/";
	let proto_file = proto_path.clone() + "api.proto";

	prost_build::compile_protos(&[&proto_file], &[&proto_path]).unwrap();

	// Create a second copy in libs/api for easier reference during development
	let rust_path = String::from(API_PATH) + "rust/";
	let rust_path_buf = PathBuf::from(rust_path);
	let rust_path_abs = fs::canonicalize(rust_path_buf).unwrap();
	let out_dir = rust_path_abs
		.to_string_lossy()
		.to_string()
		.replace("\\\\?\\", "");

	env::set_var("OUT_DIR", &out_dir);

	prost_build::compile_protos(&[&proto_file], &[&proto_path]).unwrap();
}
