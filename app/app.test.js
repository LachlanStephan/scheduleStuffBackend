const supertest = require("supertest");
const app = require("./app");
const request = supertest(app);

//////////////////////////////////////////
// Testing all routes
//////////////////////////////////////////

// Mock cookie
let cookie;

// Mock login
beforeAll(async (done) => {
  const res = await request.post("/login").send({
    email: "BobMarley@gmail.com",
    password: "Hello123",
  });
  // Mock cookie
  const cookies = res.headers["set-cookie"][0]
    .split(",")
    .map((item) => item.split(";")[0]);
  cookie = cookies.join(";");
  done();
});

// Test for successful GET user schedule
describe("GET schedule endpoint - successful", () => {
  test("should respond 200", async (done) => {
    const response = await request
      .get("/schedule/2021-03-24T14:00:00.000Z")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    done();
  });
});

// Test for GET user schedule where no content exists
describe("GET schedule endpoint - good but no content", () => {
  test("should respond 204", async (done) => {
    const response = await request.get("/schedule/2021-05-24T14:00:00.000Z");
    expect(response.status).toBe(204);
    done();
  });
});

// Test for successful POST user schedule
describe("POST addSchedule endpoint - successful", () => {
  test("should respond 201", async (done) => {
    const response = await request
      .post("/addSchedule")
      .set("cookie", cookie)
      .send({
        startDate: "2021-04-12",
        endDate: "2021-04-12",
        startTime: "09:30:00",
        endTime: "11:30:00",
        eventTitle: "Test something",
        eventDesc: "I am testing something",
      });
    expect(response.status).toBe(201);
    done();
  });
});

// Test for invalid input - POST user schedule
describe("POST addSchedule endpoint - invalid input", () => {
  test("Should respond 422", async (done) => {
    const response = await request
      .post("/addSchedule")
      .set("Cookie", cookie)
      .send({
        startDate: "2021-04-12",
        endDate: "2021-04-12",
        startTime: "",
        endTime: "11:30:00",
        eventTitle: "s",
        eventDesc: "I am testing something",
      });
    expect(response.status).toBe(422);
    done();
  });
});

// Test successful register
describe("POST regUser endpoint - successful", () => {
  test("Should respond 201", async (done) => {
    const response = await request.post("/regUser").set("Cookie", cookie).send({
      fName: "Freddy",
      lName: "Mercury",
      email: "fredM12345@gmail.com",
      password: "hello123",
    });
    expect(response.status).toBe(201);
    done();
  });
});

// Test reg where email exists
describe("POST regUser endpoint - email exists", () => {
  test("Shoudl respond 409", async (done) => {
    const response = await request.post("/regUser").set("Cookie", cookie).send({
      fName: "Bob",
      lName: "Marley2",
      email: "BobMarley@gmail.com",
      password: "whatever",
    });
    expect(response.status).toBe(409);
    done();
  });
});

// Test reg that fails val
describe("POST regUser endpoint - failed validation", () => {
  test("Should respond 422", async (done) => {
    const response = await request.post("/regUser").set("Cookie", cookie).send({
      fName: "",
      lName: "whatever",
      email: "$$$hello.com",
      password: "123",
    });
    expect(response.status).toBe(422);
    done();
  });
});
