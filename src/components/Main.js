require('normalize.css/normalize.css')
require('styles/App.scss')

import React from 'react'
import ReactDOM from 'react-dom'

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

class ImgFigure extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  /**
   * imgsFigue 的点击处理函数
   * @param {*} e
   */
  handleClick(e) {
    // 翻转和居中图片
    if (this.props.arrange.isCenter) {
      this.props.inverse()
    } else {
      this.props.center()
    }
    e.stopPropagation()
    e.preventDefault()
  }
  render() {
    let styleObj = {}
    // 如果 props 属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos
    }

    // 如果图片的旋转角度有值且不为0，添加旋转角度
    if (this.props.arrange.rotate) {
      ['MozTransform', 'MsTransform', 'WebkitTransform', 'transform'].forEach(
        value => {
          styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)'
        }
      )
    }

    let imgFigureClassName = 'img-figure'
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : ''

    if (this.props.arrange.isCenter) {
      styleObj.zIndex = 11
    }

    return (
      <figure
        className={imgFigureClassName}
        style={styleObj}
        onClick={this.handleClick}
      >
        <img
          className="img-responsive"
          src={this.props.data.url}
          alt={this.props.data.title}
        />
        <figureacption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>{this.props.data.desc}</p>
          </div>
        </figureacption>
      </figure>
    )
  }
}

/**
 * 获取区间内的随机数
 * @param {*} low
 * @param {*} high
 */
function getRangeRandom(low, high) {
  return Math.ceil(Math.random() * (high - low) + low)
}

/**
 * 获取 0~30° 之间任意一个正负值
 */
function get30DegRandom() {
  return (Math.random() > 0.5 ? '' : '-') + Math.random() * 30
}

/**
 * 控制组件
 */
class ControllerUnit extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick(e) {
    // 如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse()
    } else {
      this.props.center()
    }
    e.stopPropagation()
    e.preventDefault()
  }
  render() {
    let controllerUnitClassName = 'controller-unit'
    // 如果对应的是居中图片，显示控制按钮的居中态
    if (this.props.arrange.isCenter) {
      controllerUnitClassName += ' is-center'

      // 如果同时对应的是翻转图片，显示按钮的翻转态
      if (this.props.arrange.isInverse) {
        controllerUnitClassName += ' is-inverse'
      }
    }
    return (
      <span className={controllerUnitClassName} onClick={this.handleClick} />
    )
  }
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      imgsArrangeArr: [
        // {
        //   pos: {
        //     left: '0',
        //     top: '0'
        //   },
        //   rotate: 0, // 旋转角度
        //   isInverse: false, // 图片正反面
        //   isCenter: false // 图片是否居中
        // }
      ]
    }
    this.Constant = {
      centerPos: {
        left: 0,
        right: 0
      },
      hPosRange: {
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      vPosRange: {
        x: [0, 0],
        topY: [0, 0]
      }
    }
  }

  // 组件加载以后， 为每张图片计算其位置范围
  componentDidMount() {
    // 获取舞台大小
    const stageDOM = ReactDOM.findDOMNode(this.refs.stage),
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2)
    // 获取一个 imgFigure 的大小
    const imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW = imgFigureDOM.scrollWidth,
      imgH = imgFigureDOM.scrollHeight,
      halfImgW = Math.ceil(imgW / 2),
      halfImgH = Math.ceil(imgH / 2)
    // 计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }
    // 计算左侧、右侧区域图片排布位置的取值范围
    this.Constant.hPosRange = {
      leftSecX: [-halfImgW, halfStageW - halfImgW * 3],
      rightSecX: [halfStageW + halfImgW, stageW - halfImgH],
      y: [-halfImgH, stageH - halfImgH]
    }
    // 计算上侧区域图片排布位置的取值范围
    this.Constant.vPosRange = {
      x: [halfStageW - imgW, halfStageW],
      topY: [-halfImgH, halfStageH - halfImgH * 3]
    }

    this.rearrange(0)
  }

  /**
   * 翻转图片
   * @param {*} index  输入当前被执行 inverse 操作的图片对应的图片信息数组的 index 值
   * return {Function}  闭包函数，其内 return 一个真正待被执行的函数
   */
  inverse(index) {
    return () => {
      let imgsArrangArr = this.state.imgsArrangeArr
      imgsArrangArr[index].isInverse = !imgsArrangArr[index].isInverse
      this.setState({
        imgsArrangeArr: imgsArrangArr
      })
    }
  }

  /**
   * 利用 rearrange 函数，居中对应 index 图片
   * @param {*} index  需要被居中的图片对应的图片信息数组的 index 值
   */
  center(index) {
    return () => {
      this.rearrange(index)
    }
  }

  /**
   * 重新布局所有图片
   * @param {*} centerIndex  指定居中排布哪个图片
   */
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
      Constant = this.Constant,
      centerPos = Constant.centerPos,
      hPosRange = Constant.hPosRange,
      vPosRange = Constant.vPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRightSecX = hPosRange.rightSecX,
      hPosRangeY = hPosRange.y,
      vPosRangeX = vPosRange.x,
      vPosRangeTopY = vPosRange.topY,
      imgsArrangeTopArr = [],
      topImgNum = Math.floor(Math.random() * 2), // 取一个或者不取
      topImgSpliceIndex = 0,
      imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1)

    // 居中的 centerIndex 图片, 居中的 centerIndex 图片不需要旋转
    imgsArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true
    }

    // 取出要布局上侧的图片的状态信息
    topImgSpliceIndex = Math.ceil(
      Math.random() * (imgsArrangeArr.length - topImgNum)
    )
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum)

    // 布局位于上侧的图片
    imgsArrangeTopArr.forEach((value, index) => {
      imgsArrangeTopArr[index] = {
        pos: {
          top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
          left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    })

    // 布局左右两侧的图片
    for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
      let hPosRangeLORX = null
      // 前半部分布局左边，后半部分布局右边
      if (i < k) {
        hPosRangeLORX = hPosRangeLeftSecX
      } else {
        hPosRangeLORX = hPosRangeRightSecX
      }
      imgsArrangeArr[i] = {
        pos: {
          top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
          left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    }

    if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
      imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0])
    }

    imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0])

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    })
  }

  render() {
    const controllerUnits = [],
      imgFigure = []
    imageDatas.forEach((value, index) => {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            top: 0,
            left: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }
      imgFigure.push(
        <ImgFigure
          data={value}
          key={index}
          ref={'imgFigure' + index}
          arrange={this.state.imgsArrangeArr[index]}
          inverse={this.inverse(index)}
          center={this.center(index)}
        />
      )
      controllerUnits.push(
        <ControllerUnit
          key={index}
          arrange={this.state.imgsArrangeArr[index]}
          inverse={this.inverse(index)}
          center={this.center(index)}
        />
      )
    })

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">{imgFigure}</section>
        <nav className="controller-nav">{controllerUnits}</nav>
      </section>
    )
  }
}

AppComponent.defaultProps = {}

export default AppComponent
