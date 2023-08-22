const { getRandomQuote } = require('../todo');

describe('Todo App Functions', () => {
    // Mocking file system functions for loadTasks and saveTasks
    const mockReadFileSync = jest.fn();
    const mockWriteFileSync = jest.fn();

    beforeEach(() => {
        // Reset the mocks before each test
        mockReadFileSync.mockClear();
        mockWriteFileSync.mockClear();

        // Mock the file system functions
        jest.spyOn(require('fs'), 'readFileSync').mockImplementation(mockReadFileSync);
        jest.spyOn(require('fs'), 'writeFileSync').mockImplementation(mockWriteFileSync);
    });

    test('Example test', () => {
        // Example test case
        expect(1 + 1).toBe(2);
    });

});
