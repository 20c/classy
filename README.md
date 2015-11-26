# Purpose

An approach to javascript class management and namespacing 

* class definition
* class inheritance
* support and differentiation of class methods / properties and instance methods / properties
* namespacing

# Examples

## Namespacing because we like it tidy.

    var example = classy.space()

## Define a class

    example.$define(
      // name of the class
      "MyClass",
      {
        // constructor
        "MyClass" : function(num) { this.num = num; },

        // instance method
        "calc" : function() { return this.num * 2 }
      }
    );

## Instantiate a class 

    var instance = example.MyClass.$init(10)
    instance.calc(); // 20

## Each class defined in a classy space creates its own space
    
    example.MyClass.$define(
      "MySubClass",
      {
        do_something : function() { return; }
      }
    );

    var instance = example.MyClass.MySubClass.$init();

## Inheritance

    example.MyClass.$fork(
      "MyOtherClass",
      {
        "calc" : function() {
          return this.MyClass_calc() + 5
        }
      }
    );

    var instance = example.MyOtherClass.$init(10);
    instance.calc(); // 25

## Inheritance from multiple classes

With classy it is possible to fork multiple classes into one new class that inherits the methods and properties of all the classes provided

    example.$define(
      "First",
      {
        "first" : function() { return 1; }
      }
    );

    example.$define(
      "Second",
      {
        "second" : function() { return 2; }
      }
    );

    example.$define(
      "Third",
      {
        "third" : function() { return 3; }
      }
    );

    //forks First, Second and Third and makes a new class called "Fourth"
    example.First.$fork(
      "Fourth",
      {},
      [example.Second, example.Third]
    );

    var instance = example.Fourth.$init();
    instance.first();// 1
    instance.second();// 2
    instance.third();// 3

## Extending

You can extend existing classes with new methods using the extend class method

    example.MyClass.$extend(
      {
        "set" : function(num) {
          this.num = num;
        }
      }
    );

    var instance = example.MyClass.$init(10);
    instance.calc(); // 20
    instance.set(5);
    instance.calc(); // 10

## Class methods vs. instance methods

We come from a python background, so we thought it would be nice to have differentiation of class methods / properties
and instance method / properties in a way that makes both of them easily accessible.

    example.$define(
      "MyClass",
      {
        "$test_class_property" : 0,
        "$test_class_method" : function() {
          // methods prefixed with '$' indicate
          // class methods, meaning the 'this' keyword
          // in this context refers to the class itsself instead
          // of the instance
          this.$test_class_property++;
        },
        "test_instance_property : function(val) {
          // a normal instance method, the 'this' keyword
          // in this context refers to the instance
          this.value = val;
        }
      }
    );
    

    // class methods can be called from the class definition
    example.MyClass.$test_class_property; // 0
    example.MyClass.$test_class_method();
    example.MyClass.$test_class_property; // 1
    
    // class methods can also be called from an instance of the class
    var instance = example.MyClass.$init();
    instance.$test_class_method();
    example.MyClass.$test_class_property; // 2

## Old School classes

Our namespaced approach is a bit different then what you are probably used to, we like it because it keeps things
nice and compartmentalized while also streamlining the process of class definition and inheritance.

That said, if you want to stick to a more familiar approach to classes you can do so with the classy.define and
classy.fork functions

Note that this approach currently does not support '$' class methods. We intend to implement that in the future though. Just use the class prototype property for now.

    var MyClass = classy.define(
      "MyClass",
      {
        "hello" : function() { return "hello" }
      }
    );

    var MyOtherClass = classy.fork(
      "MyOtherClass",
      {
        "MyOtherClass" : function(name) { this.name = name },
        "hello" : function() { return this.MyClass_hello() + " " + this.name }
      },
      MyClass
    );

    var a = new MyClass();
    var b = new MyOtherClass("world");

    a.hello(); // hello
    b.hello(); // hello world
