use api::{Request, Response, MessageType, request, response};

mod ipc;

fn main() {
	let (tx, rx) = ipc::pipe();

	loop {
		let req: Request = rx.recv();
		let received = extract_message(req);

		tx.send(&Response {
			r#type: MessageType::Foo.into(),
			payload: Some(response::Payload::Foo(response::FooPayload {
				foo: format!("Received message: {}", received),
			})),
		});
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
