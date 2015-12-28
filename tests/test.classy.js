QUnit.test("classy.define", function(assert) {
  var classA = classy.define(
    "classA",
    {
      "a":function(){return "z"}
    }
  );

  var a = new classA()
  assert.equal(a.a(), "z")
});

QUnit.test("classy.define-custom-ctor", function(assert) {
  var classA = classy.define(
    "classA",
    {
      "classA" : function(value) {this.value=value},
      "a" : function() { return this.value }
    }
  );
  
  var a = new classA("z");
  assert.equal(a.a(), "z");
});

QUnit.test("classy.fork", function(assert) {

  var classA = classy.define(
    "classA",
    { 
      "a" : function() { return "hello" },
      "b" : function() { return "z" },
      "c" : function() { return "y" }
    }
  );

  var classB = classy.fork(
    "classB",
    {
      "a" : function() { return this.classA_a() + " world" }
    },
    classA
  );

  var classC = classy.fork(
    "classC",
    {
      "a" : function() { return this.classB_a() + " and everybody else" }
    },
    classB
  );

  var classD = classy.define(
    "classD",
    {
      "classD" : function(a) {
        this.a = a;
      }
    }
  );

  var classE = classy.fork(
    "classE",
    {},
    classD
  );

  var classF = classy.fork(
    "classF",
    {
      "classF" : function(a,r) {
        this.classD(a*r)
      }
    },
    classE
  );


  var a = new classA();
  var b = new classB();
  var c = new classC();
  var d = new classD(10);
  var e = new classE(10);
  var f = new classF(10, 10);
  assert.equal(b.a(), "hello world");
  assert.equal(b.b(), "z");
  assert.equal(b.c(), "y");
  assert.equal(a.a(), "hello");
  assert.equal(c.a(), "hello world and everybody else");
  assert.equal(d.a, 10);
  assert.equal(e.a, 10);
  assert.equal(f.a, 100);
});

QUnit.test("classy.fork-multiple", function(assert) {
  var classX = classy.define(
    "classX",
    {
      "x_func" : function() { return "x" }
    }
  )

  var classY = classy.define(
    "classY",
    {
      "y_func" : function() { return "y" }
    }
  );

  var classY2 = classy.fork(
    "classY2",
    {
    },
    classY
  );

  var classZ = classy.fork(
    "classZ",
    {},
    [classX, classY2]
  );

  var z = new classZ();
  assert.equal(z.x_func(), "x");
  assert.equal(z.y_func(), "y");

});

QUnit.test("classy.fork-custom-ctor", function(assert) {

  var classA = classy.define(
    "classA",
    { 
      "classA" : function(value) { this.value = value },
      "a" : function() { return this.value },
    }
  );

  var classB = classy.fork(
    "classB",
    {
      "classB" : function(value, multiplier) { 
        this.classA(value);
        this.multiplier = multiplier
      },
      "a" : function() { return this.value * this.multiplier }
    },
    classA
  );

  var a = new classA(2);
  var b = new classB(2,10);
  assert.equal(a.a(), 2);
  assert.equal(b.a(), 20);
});

QUnit.test("classy.make_name", function(assert) {
  
  assert.equal(classy.make_name("class-a"), "classA");
  assert.equal(classy.make_name("class_a"), "class_a");
  assert.equal(classy.make_name("class a b"), "classAB");

});

QUnit.test("classy.override", function(assert) {

  var classA = classy.define(
    "classA",
    { 
      a : function() { return 10; }
    }
  );

  classy.override(classA, "a", function() { return this.classA_a() * 10; });

  var a = new classA();

  assert.equal(a.a(), 100);
});


QUnit.test("classy.define_or_fork", function(assert) {
  var A = classy.define_or_fork(
    "A",
    {
      "hello" : function() { return "world" }
    }
  )

  var B = classy.define_or_fork(
    "B",
    {
      "hello" : function() { return "hello " + this.A_hello(); }
    },
    A
  );

  assert.equal(new A().hello(), "world");
  assert.equal(new B().hello(), "hello world");
});

QUnit.test("classy.space", function(assert) {
  
  // make new space
  var test = classy.space();

  assert.equal(typeof test.$define, "function");
  assert.equal(typeof test.$fork, "function");
  assert.equal(typeof test.$extend, "function");
  assert.equal(typeof test.$init, "function");
  assert.equal(typeof test.$meta, "object");
});

QUnit.test("space.define", function(assert) {

  var test = classy.space();

  test.$define(
    "A",
    {
      "$test_classmethod" : function() {
        //class method, so in this context 'this' should refer
        //to the A space object
        return this
      },
      "A" : function(num) {
        //instance constructor
        this.num = num;
      },
      "test" :  function() {
        //instance method, so in this context 'this' should refer
        //to the instace of A
        return this.num;
      }
    }
  );

  var a = test.A.$init(12);
  assert.equal(a.test(), 12);
  assert.equal(test.A.$test_classmethod(), test.A);
  assert.equal(a.$test_classmethod(), test.A);

});

QUnit.test("space.fork", function(assert) {
  
  test = classy.space();
  test.$define(
    "A",
    {
      "hello" : function() { return "hello" }
    }
  );
  test.A.$fork(
    "B",
    { 
      "$test_class" : function() { return "test" },
      "$test_class_context" : function(ctx) {
        assert.equal(this, ctx);
      },
      "hello" : function() { return this.A_hello()+" world" }
    }
  );
  test.B.$fork(
    "C",
    {
      "C" : function(name) { this.name = name },
      "hello" : function() { return this.B_hello()+", including "+this.name }
    }
  );

  var a = test.A.$init();
  var b = test.B.$init();
  var c = test.C.$init("the angry wombat");

  assert.equal(a.hello(), "hello");
  assert.equal(b.hello(), "hello world");
  assert.equal(c.hello(), "hello world, including the angry wombat");
  assert.equal(c.$test_class(), "test");

  c.$test_class_context(test.C)
  test.C.$test_class_context(test.C)
  b.$test_class_context(test.B);
  test.B.$test_class_context(test.B)

  var test2 = classy.space();
  test2.$define(
    "B",
    {
      "bye" : function() { return "goodbye" }
    },
    test.B
  );

  var b2 = test2.B.$init();
  assert.equal(b2.hello(), "hello world");
  assert.equal(b2.bye(), "goodbye");
  assert.equal(b.bye, undefined);

});

QUnit.test("space.fork-multiple", function(assert) {
  
  var test = classy.space();
  test.$define("X", {"x":function(){return "x"}});
  test.$define("Y", {"y":function(){return "y"}});
  test.X.$fork("XY", {}, test.Y);

  var xy = test.XY.$init();
  assert.equal(xy.x(), "x");
  assert.equal(xy.y(), "y");

  var test2 = classy.space();
  test2.$define("XY", {}, [test.X, test.Y]);
  var xy2 = test2.XY.$init();
  assert.equal(xy2.x(), "x");
  assert.equal(xy2.y(), "y");

});

QUnit.test("space.extend", function(assert) {
  
  var test = classy.space();
  test.$define(
    "A",
    {
      "hello" : function() { return "hello" }
    }
  );

  var a = test.A.$init();

  assert.equal(a.hello(), "hello");

  test.A.$extend(
    {
      "hello" : function() { return "hello world" }
    }
  )

  assert.equal(a.hello(), "hello world");

});

QUnit.test("chain-spacing", function(assert) {
  var a = classy.space();
  a.$define("b", { x : function() { return 1 }})
  a.b.$define("c", { x : function() { return 1 }});

  var b = a.b.$init();
  var c = a.b.c.$init();

  assert.equal(b.x(), 1);
  assert.equal(c.x(), 1);

  console.log(b._meta);
});
