require('normalize.css/normalize.css')
require('styles/App.scss')

import React from 'react'

// 获取图片相关数据
let imageDatas = require('../data/imageDatas.json')

// 利用自执行函数，将图片信息转换成图片 URL 路径
imageDatas = (function genImageURL(imageDatasArr) {
  for (let i = 0, j = imageDatasArr.length; i < j; i++) {
    let singleImageData = imageDatasArr[i]
    singleImageData.url = require('../images/' + singleImageData.fileName)
    imageDatasArr[i] = singleImageData
  }
  return imageDatasArr
})(imageDatas)

class AppComponent extends React.Component {
  render() {
    return (
      <section className="stage">
        <section className="img-sec">ssss</section>
        <nav className="controller-nav" />
      </section>
    )
  }
}

AppComponent.defaultProps = {}

export default AppComponent
