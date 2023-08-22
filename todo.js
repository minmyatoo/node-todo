const fs = require('fs');
const readline = require('readline');
const os = require('os');
const path = require('path');
const axios = require('axios');

const TASKS_FILE = 'tasks.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function getRandomQuote() {
    try {
        const response = await axios.get('https://type.fit/api/quotes');
        const data = response.data;

        if (data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            const quote = data[randomIndex];
            console.log('\n📜 Random Quote:');
            console.log(`"${quote.text}" - ${quote.author || 'Unknown'}`);
        } else {
            console.log('\n❌ No quotes found.');
        }
    } catch (error) {
        console.error('Error fetching a random quote:', error.message);
    }
}

async function loadTasks() {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveTasks(tasks) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function generateUniqueTaskId() {
    const timestamp = new Date().getTime();
    const randomId = Math.floor(Math.random() * 10000);
    return `${timestamp}-${randomId}`;
}

async function addTask() {
    const task = await askQuestion('➕ Enter a new task: ');
    const dueDate = await askQuestion('⏰ Enter due date (e.g., YYYY-MM-DD): ');
    const priority = await askQuestion('🚀 Enter task priority (e.g., High, Medium, Low): ');
    const tags = (await askQuestion('🏷️ Enter tags (comma-separated, e.g., Work,Personal): ')).split(',');

    const tasks = await loadTasks();

    const taskId = generateUniqueTaskId();
    const timestamp = getCurrentDateTime();

    tasks.push({id: taskId, task, completed: false, timestamp, dueDate, priority, tags});
    await saveTasks(tasks);
    console.log('✨ Task added successfully.');
}

async function completeTask() {
    const tasks = await loadTasks();

    if (tasks.length === 0) {
        console.log('❌ No tasks found.');
        return;
    }

    console.log('📋 Tasks:');
    tasks.forEach((task, index) => {
        const statusEmoji = task.completed ? '✅' : '❌';
        const dueDateInfo = task.dueDate ? `Due: ${task.dueDate}` : '';
        const priorityInfo = task.priority ? `Priority: ${task.priority}` : '';
        const tagsInfo = task.tags ? `Tags: ${task.tags.join(', ')}` : '';
        console.log(`  ${index + 1}. ${statusEmoji} ${task.task} ${dueDateInfo} ${priorityInfo} ${tagsInfo}`);
    });

    const taskIndex = await askQuestion('Select a task to mark as completed (enter the task number): ');

    if (taskIndex >= 1 && taskIndex <= tasks.length) {
        tasks[taskIndex - 1].completed = true;
        await saveTasks(tasks);
        console.log('✅ Task marked as completed.');
    } else {
        console.log('❌ Invalid task number. Task not marked as completed.');
    }
}

async function removeTask() {
    const tasks = await loadTasks();

    if (tasks.length === 0) {
        console.log('❌ No tasks found.');
        return;
    }

    console.log('📋 Tasks:');
    tasks.forEach((task, index) => {
        const statusEmoji = task.completed ? '✅' : '❌';
        const dueDateInfo = task.dueDate ? `Due: ${task.dueDate}` : '';
        const priorityInfo = task.priority ? `Priority: ${task.priority}` : '';
        const tagsInfo = task.tags ? `Tags: ${task.tags.join(', ')}` : '';
        console.log(`  ${index + 1}. ${statusEmoji} ${task.task} ${dueDateInfo} ${priorityInfo} ${tagsInfo}`);
    });

    const taskIndex = await askQuestion('Select a task to remove (enter the task number): ');

    if (taskIndex >= 1 && taskIndex <= tasks.length) {
        tasks.splice(taskIndex - 1, 1);
        await saveTasks(tasks);
        console.log('🗑️ Task removed successfully.');
    } else {
        console.log('❌ Invalid task number. Task not removed.');
    }
}

async function listTasks() {
    const tasks = await loadTasks();

    if (tasks.length === 0) {
        console.log('❌ No tasks found.');
    } else {
        console.log('📋 Tasks:');
        tasks.forEach((task, index) => {
            const statusEmoji = task.completed ? '✅' : '❌';
            const dueDateInfo = task.dueDate ? `Due: ${task.dueDate}` : '';
            const priorityInfo = task.priority ? `Priority: ${task.priority}` : '';
            const tagsInfo = task.tags ? `Tags: ${task.tags.join(', ')}` : '';
            console.log(`  ${index + 1}. ${statusEmoji} ${task.task} ${dueDateInfo} ${priorityInfo} ${tagsInfo}`);
        });
    }
}

async function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}

function getMachineName() {
    return os.hostname();
}

function getProjectDirectory() {
    return process.cwd(); // Get the current working directory
}

// Function to recursively search for files in a directory
function findFiles(dir) {
    let files = [];

    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            files = files.concat(findFiles(filePath));
        } else {
            files.push(filePath);
        }
    });

    return files;
}

async function editTask() {
    const tasks = await loadTasks();

    if (tasks.length === 0) {
        console.log('❌ No tasks found.');
        return;
    }

    console.log('📋 Tasks:');
    tasks.forEach((task, index) => {
        const statusEmoji = task.completed ? '✅' : ' ';
        const dueDateInfo = task.dueDate ? `Due: ${task.dueDate}` : '';
        const priorityInfo = task.priority ? `Priority: ${task.priority}` : '';
        const tagsInfo = task.tags ? `Tags: ${task.tags.join(', ')}` : '';
        console.log(`  ${index + 1}. ${statusEmoji} ${task.task} ${dueDateInfo} ${priorityInfo} ${tagsInfo}`);
    });

    const taskIndex = await askQuestion('Select a task to edit (enter the task number): ');

    if (taskIndex >= 1 && taskIndex <= tasks.length) {
        const selectedTask = tasks[taskIndex - 1];

        console.log(`\nEditing Task: ${selectedTask.task}`);

        // Allow the user to edit task details
        const newTask = await askQuestion('➕ Enter the new task description: ');
        const newDueDate = await askQuestion('⏰ Enter new due date (e.g., YYYY-MM-DD): ');
        const newPriority = await askQuestion('🚀 Enter new task priority (e.g., High, Medium, Low): ');
        const newTags = (await askQuestion('🏷️ Enter new tags (comma-separated, e.g., Work,Personal): ')).split(',');

        // Update the task details
        selectedTask.task = newTask;
        selectedTask.dueDate = newDueDate;
        selectedTask.priority = newPriority;
        selectedTask.tags = newTags;

        await saveTasks(tasks);
        console.log('✅ Task edited successfully.');
    } else {
        console.log('❌ Invalid task number. Task not edited.');
    }
}

// Function to read and extract tasks from files
function extractTasksFromFiles() {
    const files = findFiles(getProjectDirectory());
    const tasks = [];

    files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, lineNumber) => {
            if (line.includes('//todo') || line.includes('//fixme')) {
                const taskText = line.trim().replace(/\/\/todo|\/\/fixme/g, '').trim();
                tasks.push({
                    file,
                    lineNumber,
                    task: taskText,
                });
            }
        });
    });

    return tasks;
}

async function addTasksFromFilesToTodoList() {
    const extractedTasks = extractTasksFromFiles();
    const tasks = await loadTasks();

    extractedTasks.forEach((task) => {
        tasks.push({
            id: generateUniqueTaskId(),
            task: task.task,
            completed: false,
            timestamp: getCurrentDateTime(),
            source: `File: ${task.file}, Line: ${task.lineNumber}`,
        });
    });

    await saveTasks(tasks);
    console.log(`✨ ${extractedTasks.length} tasks extracted and added to the todo list.`);
}

async function eisenhowerMatrix() {
    const tasks = await loadTasks();

    if (tasks.length === 0) {
        console.log('❌ No tasks found.');
        return;
    }

    const urgentImportant = tasks.filter((task) => task.priority === 'High' && !task.completed);
    const notUrgentImportant = tasks.filter((task) => task.priority === 'High' && task.completed);
    const urgentNotImportant = tasks.filter((task) => task.priority !== 'High' && !task.completed);
    const notUrgentNotImportant = tasks.filter((task) => task.priority !== 'High' && task.completed);

    const quadrants = [
        {
            title: 'Quadrant I - Urgent & Important',
            tasks: urgentImportant,
        },
        {
            title: 'Quadrant II - Not Urgent & Important',
            tasks: notUrgentImportant,
        },
        {
            title: 'Quadrant III - Urgent & Not Important',
            tasks: urgentNotImportant,
        },
        {
            title: 'Quadrant IV - Not Urgent & Not Important',
            tasks: notUrgentNotImportant,
        },
    ];

    let currentQuadrant = 0;

    function displayQuadrant() {
        console.clear();
        console.log(quadrants[currentQuadrant].title);
        console.log('───────────────────────────────────');
        quadrants[currentQuadrant].tasks.forEach((task, index) => {
            console.log(`[${index + 1}] ${task.task}`);
        });
        console.log('───────────────────────────────────');
        console.log('Use arrow keys to navigate (← →). Press any other key to exit.');
    }

    displayQuadrant();

    rl.input.on('keypress', (str, key) => {
        if (key.name === 'right' && currentQuadrant < 3) {
            currentQuadrant++;
            displayQuadrant();
        } else if (key.name === 'left' && currentQuadrant > 0) {
            currentQuadrant--;
            displayQuadrant();
        } else {
            rl.close();
        }
    });
}

async function main() {
    console.log(`\nTodo List Menu`);
    console.log(`Machine Name: ${getMachineName()}`);
    console.log(`Current Date and Time: ${getCurrentDateTime()}`);

    while (true) {
        console.log('\nMenu:');
        console.log('1. ➕ Add Task');
        console.log('2. 📋 List Tasks');
        console.log('3. ✅ Complete Task');
        console.log('4. 🗑️ Remove Task');
        console.log('5. 📝 Extract Tasks from Files');
        console.log('6. 📊 Eisenhower Matrix');
        console.log('7. ✏️ Edit Task');
        console.log('8. ⏳ Pomodoro Timer');
        console.log('9. 📜 Random Quote'); // Added the quote option
        console.log('10. 🚪 Exit');

        const choice = await askQuestion('Enter your choice (1-10): ');

        switch (choice) {
            case '1':
                await addTask();
                break;
            case '2':
                await listTasks();
                break;
            case '3':
                await completeTask();
                break;
            case '4':
                await removeTask();
                break;
            case '5':
                await addTasksFromFilesToTodoList();
                break;
            case '6':
                await eisenhowerMatrix();
                break;
            case '7':
                await editTask();
                break;
            case '8':
                await startPomodoroTimer();
                break;

            case '9':
                await getRandomQuote(); // Added the quote option
                break;
            case '10':
                rl.close();
                return;
            default:
                console.log('Invalid choice. Please enter a number from 1 to 10.');
                break;
        }
    }
}

async function startPomodoroTimer() {
    const pomodoroDuration = 25 * 60; // 25 minutes in seconds
    const breakDuration = 5 * 60; // 5 minutes in seconds
    let timerRunning = false;

    console.log('\n🍅 Pomodoro Timer');
    console.log('1. Start Pomodoro');
    console.log('2. Start Short Break');
    console.log('3. Start Long Break');
    console.log('4. Stop Timer');
    console.log('5. Exit Pomodoro Timer');

    while (true) {
        const choice = await askQuestion('Enter your choice (1-5): ');

        switch (choice) {
            case '1':
                if (!timerRunning) {
                    console.log('🍅 Pomodoro timer started. Focus for 25 minutes.');
                    await runTimer(pomodoroDuration);
                    console.log('🍅 Pomodoro completed! Take a short break.');
                    await runTimer(breakDuration);
                    console.clear();
                    timerRunning = false;
                } else {
                    console.log('A timer is already running. Stop it before starting a new one.');
                }
                break;
            case '2':
                if (!timerRunning) {
                    console.log('🍅 Short break timer started. Relax for 5 minutes.');
                    await runTimer(breakDuration);
                    console.clear();
                    timerRunning = false;
                } else {
                    console.log('A timer is already running. Stop it before starting a new one.');
                }
                break;
            case '3':
                if (!timerRunning) {
                    console.log('🍅 Long break timer started. Relax for 15 minutes.');
                    await runTimer(breakDuration * 3);
                    console.clear();
                    timerRunning = false;
                } else {
                    console.log('A timer is already running. Stop it before starting a new one.');
                }
                break;
            case '4':
                if (timerRunning) {
                    console.log('Timer stopped.');
                    timerRunning = false;
                } else {
                    console.log('No timer is currently running.');
                }
                break;
            case '5':
                return;
            default:
                console.log('Invalid choice. Please enter a number from 1 to 5.');
                break;
        }
    }
}

async function runTimer(duration) {
    return new Promise((resolve) => {
        let seconds = duration;
        timerRunning = true;
        const timer = setInterval(() => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            console.clear();
            console.log(`⏲️ Time remaining: ${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`);

            if (seconds === 0) {
                clearInterval(timer);
                resolve();
            } else {
                seconds--;
            }
        }, 1000);
    });
}

main();
