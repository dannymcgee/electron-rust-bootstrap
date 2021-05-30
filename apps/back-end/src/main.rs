use std::{borrow::Cow::Borrowed, io::{self, BufRead, Write}};
use quick_protobuf::{BytesReader, MessageRead, Writer};

mod hello_world;
use hello_world::HelloWorld;

fn main() {
	let stdin = io::stdin();
	let mut stdout = io::stdout();

	let mut bytes: Vec<u8> = vec![];

	loop {
		stdin.lock()
			.read_until(b'\r', &mut bytes)
			.unwrap();

		bytes.pop();

		let mut reader = BytesReader::from_bytes(&bytes);
		let _request = HelloWorld::from_reader(&mut reader, &bytes).unwrap();

		// Do something with request

		let response = HelloWorld {
			value: Borrowed("Hello from back-end!"),
		};

		Writer::new(stdout.lock())
			.write_message(&response)
			.unwrap();

		stdout.flush().unwrap();

		bytes.clear();
	}
}
