use std::env;

fn main() {
	env::set_var("OUT_DIR", "src/");
	prost_build::compile_protos(&["../proto/api.proto"], &["../proto"]).unwrap();
}
