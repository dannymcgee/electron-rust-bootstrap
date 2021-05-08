use std::io::{self, Write};

fn main() {
	let stdin = io::stdin();
	let mut stdout = io::stdout();

	loop {
		let mut input = String::new();
		match stdin.read_line(&mut input) {
			Ok(_) => {
				write!(stdout, "Back-End received: {}", input)
					.expect("Failed to write to stdout!");

				stdout.flush().unwrap();
			}
			Err(err) => {
				eprintln!("{}", err);
			}
		}
	}
}
