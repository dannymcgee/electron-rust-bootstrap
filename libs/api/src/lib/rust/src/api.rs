#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Request {
}
/// Nested message and enum types in `Request`.
pub mod request {
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Header {
        #[prost(enumeration="super::MessageType", tag="1")]
        pub msg_type: i32,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Foo {
        #[prost(string, tag="2")]
        pub foo: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Bar {
        #[prost(string, tag="3")]
        pub bar: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Baz {
        #[prost(string, tag="4")]
        pub baz: ::prost::alloc::string::String,
    }
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Response {
}
/// Nested message and enum types in `Response`.
pub mod response {
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Header {
        #[prost(enumeration="super::MessageType", tag="1")]
        pub msg_type: i32,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Foo {
        #[prost(string, tag="2")]
        pub foo: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Bar {
        #[prost(string, tag="3")]
        pub bar: ::prost::alloc::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Baz {
        #[prost(string, tag="4")]
        pub baz: ::prost::alloc::string::String,
    }
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
#[repr(i32)]
pub enum MessageType {
    None = 0,
    Foo = 1,
    Bar = 2,
    Baz = 3,
}
