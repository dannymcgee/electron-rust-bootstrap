#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Request {
    #[prost(enumeration="MessageType", tag="1")]
    pub r#type: i32,
    #[prost(oneof="request::Payload", tags="2, 3, 4")]
    pub payload: ::core::option::Option<request::Payload>,
}
/// Nested message and enum types in `Request`.
pub mod request {
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct FooPayload {
        #[prost(string, tag="5")]
        pub foo: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct BarPayload {
        #[prost(string, tag="6")]
        pub bar: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct BazPayload {
        #[prost(string, tag="7")]
        pub baz: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Payload {
        #[prost(message, tag="2")]
        Foo(FooPayload),
        #[prost(message, tag="3")]
        Bar(BarPayload),
        #[prost(message, tag="4")]
        Baz(BazPayload),
    }
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Response {
    #[prost(enumeration="MessageType", tag="1")]
    pub r#type: i32,
    #[prost(oneof="response::Payload", tags="2, 3, 4")]
    pub payload: ::core::option::Option<response::Payload>,
}
/// Nested message and enum types in `Response`.
pub mod response {
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct FooPayload {
        #[prost(string, tag="5")]
        pub foo: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct BarPayload {
        #[prost(string, tag="6")]
        pub bar: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct BazPayload {
        #[prost(string, tag="7")]
        pub baz: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Payload {
        #[prost(message, tag="2")]
        Foo(FooPayload),
        #[prost(message, tag="3")]
        Bar(BarPayload),
        #[prost(message, tag="4")]
        Baz(BazPayload),
    }
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
#[repr(i32)]
pub enum MessageType {
    Foo = 0,
    Bar = 1,
    Baz = 2,
}
