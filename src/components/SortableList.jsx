import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    background: "white",
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          {...attributes}
          {...listeners}
          style={{
            cursor: "grab",
            userSelect: "none",
            padding: "4px 8px",
            border: "1px solid #eee",
            borderRadius: 8,
          }}
          title="Drag to reorder"
        >
          ⠿
        </span>

        <div>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {item.kind === "pdf" ? "PDF" : "Image"}
          </div>
        </div>
      </div>

      <button onClick={() => onRemove(item.id)}>Remove</button>
    </li>
  );
}

export default function SortableList({ items, setItems, onRemove }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id);
      const newIndex = prev.findIndex((x) => x.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
          {items.map((item) => (
            <SortableRow key={item.id} item={item} onRemove={onRemove} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}