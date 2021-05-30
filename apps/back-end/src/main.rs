use std::io::{self, BufRead, Write};

use api::{Request, Response, MessageType, request, response};
use prost::Message;

fn main() {
	let stdin = io::stdin();
	let mut stdout = io::stdout();
	let mut bytes = vec![];

	loop {
		stdin.lock()
			.read_until(b'\r', &mut bytes)
			.unwrap();
		bytes.pop();

		let req = Request::decode(&bytes[..]).unwrap();

		bytes.clear();

		// Do something with request
		let received = extract_message(req);

		// Send response
		let response = Response {
			r#type: MessageType::Foo.into(),
			payload: Some(response::Payload::Foo(response::FooPayload {
				foo: format!("Received message: {}", received),
			})),
		};
		response.encode(&mut bytes).unwrap();

		stdout.lock()
			.write_all(&bytes)
			.unwrap();
		stdout.flush().unwrap();

		bytes.clear();
	}
}

#[allow(clippy::blacklisted_name)]
fn extract_message(req: Request) -> String {
	use request::*;

	match req.payload {
		Some(Payload::Foo(FooPayload { foo })) => foo,
		Some(Payload::Bar(BarPayload { bar })) => bar,
		Some(Payload::Baz(BazPayload { baz })) => baz,
		None => unreachable!(),
	}
}
