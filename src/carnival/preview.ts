// A development page (not part of the game): the Carnival's board at the window's size, for the owner to see the
// shape (Step I phase D). Open /src/carnival/preview.html with `npm run dev`. ?at=12,40,77,100 puts the tokens there.
import "@fontsource/patrick-hand";
import "../ui/app.css";
import { parseBoard3 } from "../engine/v3";
import carnivalJson from "../../data/carnival.json";
import { CarnivalBoard } from "./board-view";

const board = parseBoard3(carnivalJson);
const at = (new URLSearchParams(location.search).get("at") ?? "").split(",").filter(Boolean).map(Number);
const players = Math.max(4, at.length);
const view = new CarnivalBoard(document.getElementById("board")!, board, players, () => {});
at.forEach((pos, seat) => view.setPlace(seat, pos));
view.setCurrent(0);
