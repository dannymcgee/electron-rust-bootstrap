import { Field, Message, OneOf, Type } from "protobufjs";

export namespace api {

	export enum MessageType {
		Foo = 0,
		Bar = 1,
		Baz = 2,
	}

	@Type.d("RequestFooPayload")
	class RequestFooPayload extends Message<RequestFooPayload> {
		@Field.d(5, "string") foo: string;
	}
	@Type.d("RequestBarPayload")
	class RequestBarPayload extends Message<RequestFooPayload> {
		@Field.d(6, "string") bar: string;
	}
	@Type.d("RequestBazPayload")
	class RequestBazPayload extends Message<RequestFooPayload> {
		@Field.d(7, "string") baz: string;
	}

	@Type.d("Request")
	export class Request extends Message<Request> {
		static FooPayload = RequestFooPayload;
		static BarPayload = RequestBarPayload;
		static BazPayload = RequestBazPayload;

		@Field.d(1, MessageType) type: MessageType;

		@Field.d(2, RequestFooPayload) foo: RequestFooPayload;
		@Field.d(3, RequestBarPayload) bar: RequestBarPayload;
		@Field.d(4, RequestBazPayload) baz: RequestBazPayload;

		@OneOf.d("foo", "bar", "baz")
		payload: string;
	}


	@Type.d("ResponseFooPayload")
	class ResponseFooPayload extends Message<ResponseFooPayload> {
		@Field.d(5, "string") foo: string;
	}
	@Type.d("ResponseBarPayload")
	class ResponseBarPayload extends Message<ResponseBarPayload> {
		@Field.d(6, "string") bar: string;
	}
	@Type.d("ResponseBazPayload")
	class ResponseBazPayload extends Message<ResponseBazPayload> {
		@Field.d(7, "string") baz: string;
	}

	@Type.d("Response")
	export class Response extends Message<Response> {
		static FooPayload = ResponseFooPayload;
		static BarPayload = ResponseBarPayload;
		static BazPayload = ResponseBazPayload;

		@Field.d(1, MessageType) type: MessageType;

		@Field.d(2, ResponseFooPayload) foo: ResponseFooPayload;
		@Field.d(3, ResponseBarPayload) bar: ResponseBarPayload;
		@Field.d(4, ResponseBazPayload) baz: ResponseBazPayload;
	}

}
