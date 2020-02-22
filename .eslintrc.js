module.exports = {
  "rules": {
    "quotes": [1, "single"],
    "quote-props": [1, "as-needed"],
    "no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "Taro"
      }
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": [
          true
        ]
      }
    ],
    "import/no-commonjs": 0,
    "import/no-named-as-default-member": 0,
    "import/prefer-default-export": 0,
    "react/jsx-boolean-value": 0,
    "import/first": 0,
    "no-unused-vars": 1,
    "jsx-quotes": 0,
  },

  //插件
  "plugins": [
    "prettier",
  ],

  //配置解析器
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
  },

  "env": {//脚本目标的运行环境
    "browser": true,
    "node": true,
    "es6": true,
    "commonjs": true
  },

  //全局变量
  "globals": {
    "__DEV__": true,
    "__WECHAT__": true,
    "__ALIPAY__": true,
    "App": true,
    "Page": true,
    "Component": true,
    "Behavior": true,
    "wx": true,
    "getApp": true,
  }
}