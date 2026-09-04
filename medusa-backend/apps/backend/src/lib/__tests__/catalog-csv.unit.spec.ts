import { parseCsv } from "../catalog";

describe("catalog.parseCsv", () => {
  it("parses a header + rows into objects", () => {
    const rows = parseCsv("handle,stock\nglow-serum,50\nrose-elixir,12");
    expect(rows).toEqual([
      { handle: "glow-serum", stock: "50" },
      { handle: "rose-elixir", stock: "12" },
    ]);
  });

  it("trims header and cell whitespace", () => {
    const rows = parseCsv(" handle , stock \n  a  , 5 ");
    expect(rows[0]).toEqual({ handle: "a", stock: "5" });
  });

  it("respects quoted fields containing commas", () => {
    const rows = parseCsv('handle,title\np1,"Serum, Glow"');
    expect(rows[0].title).toBe("Serum, Glow");
  });

  it("unescapes doubled quotes inside quoted fields", () => {
    const rows = parseCsv('handle,title\np1,"a ""b"" c"');
    expect(rows[0].title).toBe('a "b" c');
  });

  it("handles CRLF line endings and a trailing newline", () => {
    const rows = parseCsv("handle,stock\r\na,1\r\n");
    expect(rows).toEqual([{ handle: "a", stock: "1" }]);
  });

  it("fills missing trailing columns with empty strings", () => {
    const rows = parseCsv("handle,title,price\np1");
    expect(rows[0]).toEqual({ handle: "p1", title: "", price: "" });
  });

  it("returns [] for empty input", () => {
    expect(parseCsv("")).toEqual([]);
    expect(parseCsv("\n\n")).toEqual([]);
  });
});
