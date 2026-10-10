import EmptyState from './EmptyState.jsx';
import TimelineEntry from './TimelineEntry.jsx';

function Timeline({ entries, onEditEntry, onDeleteEntry }) {
  if (!entries?.length) {
    return <EmptyState title="No diary entries yet" message="Entries will appear here after they are added." />;
  }

  const sortedEntries = [...entries].sort((first, second) => {
    if (first.entry_date === second.entry_date) {
      return first.id - second.id;
    }
    return first.entry_date.localeCompare(second.entry_date);
  });
  const highlightedEntryId = sortedEntries[sortedEntries.length - 1]?.id;

  return (
    <div className="timeline">
      {sortedEntries.map((entry) => (
        <TimelineEntry
          entry={entry}
          highlighted={entry.id === highlightedEntryId}
          key={entry.id}
          onDelete={() => onDeleteEntry(entry)}
          onEdit={() => onEditEntry(entry)}
        />
      ))}
    </div>
  );
}

export default Timeline;
