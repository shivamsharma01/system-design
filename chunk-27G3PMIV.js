import{a as e}from"./chunk-YGTNZSJE.js";import"./chunk-IFGU66OU.js";var o={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Mediator** centralizes complex communication between objects (**colleagues**). Instead of every object referencing every other, colleagues talk only to the mediator, which routes and coordinates interactions \u2014 reducing tangled many-to-many dependencies."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"An **air-traffic control tower**: planes do not negotiate pairwise flight paths; they communicate with the tower, which coordinates safe landings."},{type:"mermaid",caption:"Hub-and-spoke instead of a mesh.",definition:`flowchart TB
  M[ChatMediator]
  U1[User A] --> M
  U2[User B] --> M
  U3[User C] --> M
  M --> U1
  M --> U2
  M --> U3`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Chat / messaging","Chat room object routing messages"],["UI dialogs","Enable/disable fields based on other controls"],["Air traffic / games","Central coordinator for entities"],["Workflows","Orchestrator coordinating steps (related)"],["CQRS buses","In-process mediator dispatching commands/queries (MediatR-style)"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"ChatMediator.java",code:`public interface ChatMediator {
  void send(String from, String message);
  void join(User user);
}

public class ChatRoom implements ChatMediator {
  private final List<User> users = new ArrayList<>();

  public void join(User user) { users.add(user); }

  public void send(String from, String message) {
    for (User u : users) {
      if (!u.name().equals(from)) {
        u.receive(from, message);
      }
    }
  }
}

public class User {
  private final String name;
  private final ChatMediator room;

  public User(String name, ChatMediator room) {
    this.name = name;
    this.room = room;
    room.join(this);
  }

  public String name() { return name; }
  public void send(String msg) { room.send(name, msg); }
  public void receive(String from, String msg) {
    System.out.println(name + " <- " + from + ": " + msg);
  }
}`},{type:"prosCons",title:"Trade-offs",pros:["Colleagues stay decoupled from each other.","Interaction policy lives in one place.","Easier to change communication rules."],cons:["Mediator can become a god object.","Indirection can obscure call flow."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Mediator vs Observer?",answer:"Observer: many listen to one subject. Mediator: many colleagues communicate **through a hub** to avoid pairwise links. A mediator may use observer-style callbacks internally."},{question:"Mediator vs Facade?",answer:"Facade simplifies access to a subsystem for **external** clients. Mediator coordinates **peer** objects inside a group."},{question:"When does Mediator go wrong?",answer:"When all application logic piles into one mediator \u2014 split by bounded context or use events/buses with clearer ownership."},{question:"LLD example?",answer:"Airport control; form wizard where selecting \u201CCompany\u201D enables tax fields via a dialog mediator; multiplayer lobby coordinating players."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Mediator = **hub** for colleague communication.
2. Real uses: **chat rooms, UI dialogs, coordinators**.
3. Reduces mesh coupling; watch for god mediators.
4. Contrast with Observer and Facade.`}]}]},i=o;export{i as default};
