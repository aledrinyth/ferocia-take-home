## Changes

* **API Integration**: Implemented live HTTP requests to `server.js` to dynamically fetch Tax and HEM values.
* **Environment Configuration**: Decoupled hardcoded PATs, URLs, and ports into a centralized `.env` configuration, allowing dynamic token injection for incoming requests.
* **OOP Refactoring**: Encapsulated borrowing power logic and state inside a dedicated `Calculator` class within `borrowingcalculator.js`.
* **Input & Calculation Validation**: Added guard clauses to validate inputs, outputs, and edge cases (e.g., negative values and 0% interest rate division-by-zero protection).
* **Security Fixes**: Upgraded `mocha` from `11.7` to `12.0` to resolve known dependency vulnerabilities.
* **Unit Testing**: Added comprehensive unit test suites to verify math accuracy, validation rules, mocked API responses, and edge cases.
