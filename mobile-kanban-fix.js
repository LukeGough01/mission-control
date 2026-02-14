// Mobile touch support for Kanban drag-and-drop
// Add this to the pipeline page script

var touchCard = null;
var touchStartCol = null;

// Add touch handlers to cards after rendering
function addTouchHandlers() {
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd, { passive: false });
  });
}

function handleTouchStart(e) {
  touchCard = e.currentTarget;
  touchStartCol = touchCard.closest('.kanban-col').dataset.col;
  touchCard.classList.add('dragging');
  e.preventDefault();
}

function handleTouchMove(e) {
  if (!touchCard) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const column = elementBelow?.closest('.kanban-col');
  
  // Remove drag-over from all columns
  document.querySelectorAll('.kanban-col').forEach(col => col.classList.remove('drag-over'));
  
  // Add drag-over to current column
  if (column) {
    column.classList.add('drag-over');
  }
}

function handleTouchEnd(e) {
  if (!touchCard) return;
  e.preventDefault();
  
  const touch = e.changedTouches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const column = elementBelow?.closest('.kanban-col');
  
  // Remove drag-over from all columns
  document.querySelectorAll('.kanban-col').forEach(col => col.classList.remove('drag-over'));
  
  if (column) {
    const newCol = column.dataset.col;
    const taskId = touchCard.dataset.id;
    if (newCol !== touchStartCol) {
      updateTaskColumn(taskId, newCol);
    }
  }
  
  touchCard.classList.remove('dragging');
  touchCard = null;
  touchStartCol = null;
}

// Call this after renderBoard()
// Add: addTouchHandlers();
