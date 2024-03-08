export default function Knockout() {
  return (
    <section className="h-full w-full flex flex-col pt-4">
      <div className="w-full grow flex sm:gap-2 md:gap-4">
        {/* Quarter finals column */}
        <div className="grow flex flex-col justify-center items-center">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span>Quarter Finals</span>
          </div>

          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
        </div>

        {/* Semi finals column */}
        <div className="grow flex flex-col justify-center items-center">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span>Semi Finals</span>
          </div>

          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
        </div>

        {/* finals column */}
        <div className="grow flex flex-col justify-center items-center">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span>Final</span>
          </div>

          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="player_1" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="player_1" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Divider({
  children,
  childrenStyles,
  containerStyles,
}: {
  children?: React.ReactNode;
  childrenStyles?: React.CSSProperties;
  containerStyles?: React.CSSProperties;
}) {
  return (
    <div className="relative" style={containerStyles}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background" style={childrenStyles}>
          {children}
        </span>
      </div>
    </div>
  );
}

function PlayerBracket({ name }: { name: string }) {
  return (
    <div className="w-[75%] rounded-xl h-16 bg-primary-foreground flex justify-center items-center">
      {name}
    </div>
  );
}
