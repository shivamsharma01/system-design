import{a as e}from"./chunk-GQXOAMTE.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Iterator** provides a way to access elements of an aggregate sequentially without exposing its underlying representation (array, tree, graph, lazy stream). Clients use `hasNext` / `next` (or enhanced for-loops) against a uniform interface."},{type:"callout",variant:"info",title:"Already in the JDK",body:"`Iterable` / `Iterator`, `ListIterator`, and the enhanced `for` loop are the standard Java realization of this pattern."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **TV remote channel+ button**: you flip to the next channel without knowing whether channels are stored as a list, a map of frequencies, or a live guide API."}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Collections","Java/C#/Python iterators over lists and sets"],["File systems","Walk directory trees depth-first / breadth-first"],["Databases","Cursor-based result iteration"],["Graphs","BFS/DFS iterators over nodes"],["Lazy sequences","Generators / streams producing values on demand"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"PlaylistIterator.java",code:`import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

public class Playlist implements Iterable<Song> {
  private final List<Song> songs;

  public Playlist(List<Song> songs) { this.songs = List.copyOf(songs); }

  public Iterator<Song> iterator() {
    return new Iterator<>() {
      private int index = 0;
      public boolean hasNext() { return index < songs.size(); }
      public Song next() {
        if (!hasNext()) throw new NoSuchElementException();
        return songs.get(index++);
      }
    };
  }
}

// client never sees List internals
for (Song song : playlist) {
  player.play(song);
}`},{type:"prosCons",title:"Trade-offs",pros:["Uniform traversal API across structures.","Supports multiple simultaneous iterators.","Can implement lazy / filtered traversal."],cons:["Fail-fast iterators break if the collection mutates.","Custom iterators add boilerplate for simple lists."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What does Iterator encapsulate?",answer:"The **position and traversal logic** for a collection, so clients do not depend on array indexes or node pointers."},{question:"Internal vs external iterator?",answer:"External: client drives `hasNext/next`. Internal: collection applies a function to each element (`forEach`, streams). Java supports both."},{question:"Why fail-fast iterators?",answer:"Detect concurrent structural modification and throw `ConcurrentModificationException` instead of returning corrupt data."},{question:"Iterator vs Visitor?",answer:"Iterator walks elements; the client decides what to do. Visitor walks a structure and dispatches type-specific operations via double dispatch."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Traverse without exposing structure.
2. Real uses: **collections, cursors, tree walks**.
3. JDK \`Iterable\` is the everyday form.
4. Know fail-fast and lazy iteration trade-offs.`}]}]},o=t;export{o as default};
