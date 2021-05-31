import { Field, Message, OneOf, Type } from "protobufjs";

export namespace api {

	export enum MessageType {
		FOO = 0,
		BAR = 1,
		BAZ = 2,
	}

	@Type.d("Request_FooPayload")
	class Request_FooPayload extends Message<Request_FooPayload> {
		@Field.d(5, "string") foo: string;
	}

	@Type.d("Request_BarPayload")
	class Request_BarPayload extends Message<Request_BarPayload> {
		@Field.d(6, "string") bar: string;
	}

	@Type.d("Request_BazPayload")
	class Request_BazPayload extends Message<Request_BazPayload> {
		@Field.d(7, "string") baz: string;
	}

	@Type.d("Request")
	export class Request extends Message<Request> {
		static FooPayload = Request_FooPayload;
		static BarPayload = Request_BarPayload;
		static BazPayload = Request_BazPayload;

		@Field.d(1, MessageType) type: MessageType;
		@Field.d(2, Request_FooPayload) foo: Request_FooPayload;
		@Field.d(3, Request_BarPayload) bar: Request_BarPayload;
		@Field.d(4, Request_BazPayload) baz: Request_BazPayload;

		@OneOf.d("foo", "bar", "baz")
		payload: string;
	}

	@Type.d("Response_FooPayload")
	class Response_FooPayload extends Message<Response_FooPayload> {
		@Field.d(5, "string") foo: string;
	}

	@Type.d("Response_BarPayload")
	class Response_BarPayload extends Message<Response_BarPayload> {
		@Field.d(6, "string") bar: string;
	}

	@Type.d("Response_BazPayload")
	class Response_BazPayload extends Message<Response_BazPayload> {
		@Field.d(7, "string") baz: string;
	}

	@Type.d("Response")
	export class Response extends Message<Response> {
		static FooPayload = Response_FooPayload;
		static BarPayload = Response_BarPayload;
		static BazPayload = Response_BazPayload;

		@Field.d(1, MessageType) type: MessageType;
		@Field.d(2, Response_FooPayload) foo: Response_FooPayload;
		@Field.d(3, Response_BarPayload) bar: Response_BarPayload;
		@Field.d(4, Response_BazPayload) baz: Response_BazPayload;

		@OneOf.d("foo", "bar", "baz")
		payload: string;
	}
}
