use std::io::{self, BufRead, Write};

use prost::Message;


#[derive(Debug, Clone)]
pub struct IpcSender;

impl IpcSender {
	pub fn send<M: Message>(&self, msg: &M) {
		let mut bytes = vec![];
		let mut stdout = io::stdout();

		msg.encode_length_delimited(&mut bytes).unwrap();

		stdout.lock()
			.write_all(&bytes)
			.unwrap();
		stdout.flush().unwrap();
	}
}


#[derive(Debug, Clone)]
pub struct IpcReceiver;

impl IpcReceiver {
	pub fn recv<M>(&self) -> M
		where M: Message + Default
	{
		let mut bytes = vec![];
		let stdin = io::stdin();

		stdin.lock()
			.read_until(b'\r', &mut bytes)
			.unwrap();

		bytes.pop();

		M::decode(&*bytes).unwrap()
	}
}


pub fn pipe() -> (IpcSender, IpcReceiver) {
	(IpcSender, IpcReceiver)
}
