#![feature(once_cell)]

use api::{MessageType, request, response};

mod ipc;

fn main() {
	let (tx, rx) = ipc::pipe();

	loop {
		let header: request::Header = rx.recv();
		let msg_type = match header.msg_type {
			x if x == MessageType::None as i32 => MessageType::None,
			x if x == MessageType::Foo as i32  => MessageType::Foo,
			x if x == MessageType::Bar as i32  => MessageType::Bar,
			x if x == MessageType::Baz as i32  => MessageType::Baz,
			_ => unreachable!(),
		};

		let received = match msg_type {
			MessageType::Foo => rx.recv::<request::Foo>().foo,
			MessageType::Bar => rx.recv::<request::Bar>().bar,
			MessageType::Baz => rx.recv::<request::Baz>().baz,
			_ => panic!("Unrecognized MessageType"),
		};

		let response = format!("Received message: {}", received);

		tx.send(&response::Header { msg_type: msg_type as i32 });
		match msg_type {
			MessageType::Foo => tx.send(&response::Foo { foo: response }),
			MessageType::Bar => tx.send(&response::Bar { bar: response }),
			MessageType::Baz => tx.send(&response::Baz { baz: response }),
			_ => unreachable!(),
		}
	}
}
