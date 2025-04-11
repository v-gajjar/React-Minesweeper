
 ![preview](https://github.com/v-gajjar/React-Minesweeper/blob/main/src/assets/Minesweeper-26-03-2025.gif)


# Dependencies

| Name | License | 
| :--- | :--- | 
| React | MIT |
| Vite | MIT |
| Classnames | MIT | 
| Phosphor Icons | MIT | 


# Attributions
* Inter font by Rasmus Andersson - SIL Open Font License 1.1

# Acknowledgements
A big thanks to the kind contributions of developers who have helped improve the project! See the list of [contributors](https://github.com/v-gajjar/React-Minesweeper/blob/main/CONTRIBUTORS.md)

# Development Roadmap
### Current focus
Refactoring the logic to extract core gameplay related functionality to seperate concerns into pure functions

### Next step: 
Add Unit Tests

### Further steps
See full [roadmap](https://github.com/v-gajjar/React-Minesweeper/blob/main/ROADMAP.md)

# Getting Started
Clone the repository:
```
git clone https://github.com/v-gajjar/React-Minesweeper.git
```

## Running locally via NPM
1. Navigate to the project directory:
   ```
   cd React-Minesweeper
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Start the dev server
   ```
   npm run dev
   ```
4. Accessing on a browser (The localhost port will usually be 5173, but it should be logged to the console)
   ```
   http://localhost:5173/
   ```
   

## Running via Docker
1. Docker Image

```
docker build -t react-minesweeper:v1 .
```

2. Running via Docker

```
docker run -itd -p 8083:80 --name minesweeper react-minesweeper:v1
```

3. Accessing on browser

The above docker run command maps port 80 of docker container to port 8083 of the host. The host port can be changed as per the user's need. The application will be accessible on browser at http://localhost:8083 in the above case.

# How to Play

- By default, all cells are closed. A number of mines will be randomly distributed across the cells. 

- The objective of the game is to open all cells that don't contain a mine.

- If you suspect a cell has a mine, you can "flag" the cell using right click. This will display a flag on the cell. 

- You can flag as many cells as you want. 

- You can open a cell using left click, however if you open a mine, the game is over.
  
- If you lose the game, incorrectly placed flags will be replaced with a cross, correctly placed flags will remain, and mines hidden in any other cells will be revealed. 

- The number on a cell is the number of mines hidden within the 8 cells that surround it. 

- To make the game fairer, mines will not be distributed until the first left-click and won't be placed on the first cell that you open. 

## Difficulty Levels

There are currently three difficulty settings
| level | board size | number of mines |
| :--- | :--- | :--- |
| easy | 9 rows by 9 columns | 10
| medium | 16 rows by 16 columns | 40
| hard | 16 rows by 30 columns | 80





   
   
   
