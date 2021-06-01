import { Field, Message, Type } from "protobufjs";

export enum MessageType {
	NONE = 0,
	FOO = 1,
	BAR = 2,
	BAZ = 3,
}

@Type.d("Request_Header")
class Request_Header extends Message<Request_Header> {
	@Field.d(1, MessageType) msgType: MessageType;
}

@Type.d("Request_Foo")
class Request_Foo extends Message<Request_Foo> {
	@Field.d(2, "string") foo: string;
}

@Type.d("Request_Bar")
class Request_Bar extends Message<Request_Bar> {
	@Field.d(3, "string") bar: string;
}

@Type.d("Request_Baz")
class Request_Baz extends Message<Request_Baz> {
	@Field.d(4, "string") baz: string;
}

@Type.d("Request")
export class Request extends Message<Request> {
	static Header = Request_Header;
	static Foo = Request_Foo;
	static Bar = Request_Bar;
	static Baz = Request_Baz;
}

@Type.d("Response_Header")
class Response_Header extends Message<Response_Header> {
	@Field.d(1, MessageType) msgType: MessageType;
}

@Type.d("Response_Foo")
class Response_Foo extends Message<Response_Foo> {
	@Field.d(2, "string") foo: string;
}

@Type.d("Response_Bar")
class Response_Bar extends Message<Response_Bar> {
	@Field.d(3, "string") bar: string;
}

@Type.d("Response_Baz")
class Response_Baz extends Message<Response_Baz> {
	@Field.d(4, "string") baz: string;
}

@Type.d("Response")
export class Response extends Message<Response> {
	static Header = Response_Header;
	static Foo = Response_Foo;
	static Bar = Response_Bar;
	static Baz = Response_Baz;
}
