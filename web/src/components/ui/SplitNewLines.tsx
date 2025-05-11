interface SplitNewLinesProps {
	message: string;
}

export const SplitNewLines = ({ message }: SplitNewLinesProps) =>
	message.split("\n").map(line => <p key={line}>{line}</p>);
