import{a as e}from"./chunk-V2SEMH2X.js";import"./chunk-IFGU66OU.js";var i={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Bridge** pattern decouples an **abstraction** from its **implementation** so both can vary independently. You compose an abstraction with an implementor interface instead of baking every combination into a subclass hierarchy."},{type:"callout",variant:"info",title:"Smell it fixes",body:"**Cartesian product of subclasses**: `EmailUrgentNotification`, `SmsUrgentNotification`, `EmailNormalNotification`, `SmsNormalNotification`\u2026 Bridge splits \u201Cwhat kind of message\u201D from \u201Chow it is delivered.\u201D"}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **remote control** (abstraction) works with many **TV brands** (implementations). You do not need SonyRemote, LGRemote, SamsungRemote for every remote feature set \u2014 the remote talks to a device interface; brands implement that interface."},{type:"mermaid",caption:"Two hierarchies linked by composition.",definition:`classDiagram
  class Notification {
    <<abstraction>>
    #channel: MessageChannel
    +send()
  }
  class UrgentNotification
  class NormalNotification
  class MessageChannel {
    <<implementor>>
    +deliver(payload)
  }
  class EmailChannel
  class SmsChannel
  Notification <|-- UrgentNotification
  Notification <|-- NormalNotification
  Notification --> MessageChannel
  MessageChannel <|.. EmailChannel
  MessageChannel <|.. SmsChannel`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Notifications","Alert priority \xD7 delivery channel (email, SMS, push)"],["Graphics","Shape hierarchy \xD7 renderer (OpenGL, Canvas, SVG)"],["Devices","Remote / device driver split in IoT or media players"],["Persistence","Repository abstraction \xD7 SQL / NoSQL drivers"],["UI toolkits","Window abstraction \xD7 OS windowing system"],["Messaging","Message type \xD7 transport (Kafka, SQS, HTTP)"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Food-delivery alerts: urgency levels compose with channels instead of multiplying classes."},{type:"code",language:"java",filename:"NotificationBridge.java",code:`public interface MessageChannel {
  void deliver(String to, String body);
}

public class EmailChannel implements MessageChannel {
  public void deliver(String to, String body) {
    // SMTP / SES
  }
}

public class SmsChannel implements MessageChannel {
  public void deliver(String to, String body) {
    // Twilio
  }
}

public abstract class Notification {
  protected final MessageChannel channel;

  protected Notification(MessageChannel channel) {
    this.channel = channel;
  }

  public abstract void send(String to);
}

public class NormalNotification extends Notification {
  private final String message;

  public NormalNotification(MessageChannel channel, String message) {
    super(channel);
    this.message = message;
  }

  public void send(String to) {
    channel.deliver(to, message);
  }
}

public class UrgentNotification extends Notification {
  private final String message;

  public UrgentNotification(MessageChannel channel, String message) {
    super(channel);
    this.message = message;
  }

  public void send(String to) {
    channel.deliver(to, "[URGENT] " + message);
    channel.deliver(to, "[URGENT] " + message); // retry / dual ping
  }
}

// mix freely
new UrgentNotification(new SmsChannel(), "Driver arriving").send("+91...");
new NormalNotification(new EmailChannel(), "Order delivered").send("a@b.com");`},{type:"prosCons",title:"Trade-offs",pros:["Avoids exponential subclass growth.","Abstraction and implementation evolve separately.","Aligns with composition over inheritance."],cons:["Indirection can confuse beginners (\u201Cwhere is the real work?\u201D).","Overkill when there is only one implementation forever."]}]},{id:"vs-related",title:"Bridge vs Adapter / Strategy",blocks:[{type:"markdown",value:`- **Adapter:** designed *after* the fact to glue incompatible APIs.
- **Bridge:** designed *up front* so abstraction and implementation can vary.
- **Strategy:** swaps algorithms for behavior; Bridge splits a structural hierarchy. They can look similar in code (composition + interface) \u2014 intent differs.`}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain Bridge in one minute.",answer:"Split a concept into an **abstraction** hierarchy and an **implementor** hierarchy, link them by composition, so combinations do not require a new subclass for every pair."},{question:"When does Bridge show up as a design smell fix?",answer:"When you see **N\xD7M subclasses** for N abstractions and M platforms/channels. Refactor into two hierarchies connected by an implementor interface."},{question:"Bridge vs Adapter?",answer:"Adapter makes unrelated interfaces work together (often legacy). Bridge is a deliberate split so both sides can extend independently. Adapter is reactive; Bridge is proactive."},{question:"Bridge vs Strategy?",answer:"Strategy focuses on **interchangeable algorithms** for one behavior. Bridge focuses on **decoupling an entire abstraction** from platform/implementation details. Code shape can overlap; interview answers should stress intent."},{question:"Give a graphics or device example.",answer:"`Shape` (Circle, Square) holds a `Renderer` (VectorRenderer, RasterRenderer). Drawing calls go through the renderer \u2014 add a new shape or a new renderer without touching the other hierarchy."},{question:"Is Dependency Injection the same as Bridge?",answer:"DI is a wiring technique. Bridge is a **structural pattern** with two hierarchies. Injecting an implementor into an abstraction is how Bridge is often realized in modern code."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Bridge = **abstraction \u2218 implementor**, both independently extensible.
2. Real uses: **channels \xD7 priorities, shapes \xD7 renderers, devices \xD7 drivers**.
3. Fixes **N\xD7M subclass explosion**.
4. Contrast with Adapter (compatibility) and Strategy (algorithms).`}]}]},n=i;export{n as default};
