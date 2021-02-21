import React, { Suspense } from "react";
import Parser from "html-react-parser";
import { Provider, atom, useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { atomWithQuery } from "jotai/query";
import { a, useSpring } from "@react-spring/web";

const postId = atom(9001);
const postData = atomWithQuery((get) => ({
  queryKey: ["post", get(postId)],
  queryFn: async ({ queryKey: [, id] }) => {
    await new Promise((r) => setTimeout(r, 1000)); // just a fake loading, it can be deleted
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    return response.json();
  }
}));

function Id() {
  const id = useAtomValue(postId);
  const props = useSpring({ from: { id: 0 }, id, reset: true });
  return <a.h1>{props.id.to(Math.round)}</a.h1>;
}

function Next() {
  const set = useUpdateAtom(postId);
  return (
    <button onClick={() => set((x) => x + 1)}>
      <div>→</div>
    </button>
  );
}

function PostTitle() {
  const [{ by, title, url, text, time }] = useAtom(postData);
  return (
    <>
      <h2>{by}</h2>
      <h6>{new Date(time * 1000).toLocaleDateString("en-US")}</h6>
      {title && <h4>{title}</h4>}
      <a href={url}>{url}</a>
      {text && <div>{Parser(text)}</div>}
    </>
  );
}

export default function App() {
  return (
    <Provider>
      <Id />
      <div>
        <Suspense fallback={<h2>Loading...</h2>}>
          <PostTitle />
        </Suspense>
      </div>
      <Next />
    </Provider>
  );
}
