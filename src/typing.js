export function initTypingAnimation() {
  const textArray = [
    "Machine Learning Engineer",
    "Full Stack Developer",
    "AI Enthusiast",
    "Computer Science Student"
  ];
  
  const textBox = document.querySelector('.rotating-text-box');
  if (!textBox) return;
  
  // Clear HTML boilerplate and build our dynamic typing structure
  textBox.innerHTML = '';
  
  const typingSpan = document.createElement('span');
  typingSpan.className = 'rotating-text-item active';
  typingSpan.style.position = 'relative';
  typingSpan.style.display = 'inline-block';
  typingSpan.style.top = '0';
  typingSpan.style.opacity = '1';
  textBox.appendChild(typingSpan);
  
  // Create a blinking caret indicator
  const caret = document.createElement('span');
  caret.className = 'typing-caret';
  caret.style.display = 'inline-block';
  caret.style.width = '2.5px';
  caret.style.height = '1.3em';
  caret.style.backgroundColor = 'var(--color-cyan)';
  caret.style.marginLeft = '4px';
  caret.style.verticalAlign = 'middle';
  caret.style.animation = 'caret-blink 0.8s step-end infinite';
  textBox.appendChild(caret);
  
  // Append keyframe styles for cursor blink
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes caret-blink {
      from, to { background-color: transparent }
      50% { background-color: var(--color-cyan); }
    }
  `;
  document.head.appendChild(styleSheet);
  
  let currentIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  
  function type() {
    const currentText = textArray[currentIdx];
    
    if (isDeleting) {
      typingSpan.textContent = currentText.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typingSpan.textContent = currentText.substring(0, charIdx + 1);
      charIdx++;
    }
    
    let typeSpeed = isDeleting ? 30 : 65; // typing and deleting velocity
    
    if (!isDeleting && charIdx === currentText.length) {
      typeSpeed = 2000; // Pause showing complete text
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      currentIdx = (currentIdx + 1) % textArray.length;
      typeSpeed = 500; // brief delay before starting next word
    }
    
    setTimeout(type, typeSpeed);
  }
  
  // Start the typing loop
  setTimeout(type, 500);
}
