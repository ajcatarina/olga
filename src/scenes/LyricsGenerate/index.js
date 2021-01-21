import React, { useState, useEffect } from 'react'
import Typography from '@material-ui/core/Typography'
import ButtonBase from '@material-ui/core/ButtonBase'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import canvg from 'canvg'
import JSZip from 'jszip'
import { useDebounce } from 'use-debounce'

//const FONT = 'Quicksand'
const FONT = 'futura'
const FONT_STYLE = 'normal'

function LyricsGenerate(props) {
  const [title, setTitle] = useState('')
  const [background, setBackground] = useState('dark')
  const [sections, setSections] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [debouncedLyrics] = useDebounce(lyrics, 777)
  const [debouncedSections] = useDebounce(sections, 777)
  const [images, setImages] = useState([])
  const [zipHref, setZipHref] = useState('')

  const lyricsSplit = lyrics.split('\n')

  let blocks = []
  let twoLines = ''
  lyricsSplit.forEach((line, index) => {
    if (index % 2 === 0) {
      twoLines = line
      if (index + 1 === lyricsSplit.length) {
        blocks.push(twoLines)
      }
    } else {
      twoLines = twoLines + '\n' + line
      blocks.push(twoLines)
    }
  })

  useEffect(() => {
    let _sections = sections.split('|')
    
    for (let i = _sections.length; i < blocks.length; i++) {
      _sections.push('VERSE 1-' + (i + 1))
    }
    
    if (_sections.length === 1) {
      _sections[0] = 'VERSE 1-1'
    }
    
    setSections(_sections.join('|'))
  }, [blocks.length])
  
  const _sections = sections.split('|')

  let ready = debouncedLyrics === lyrics && debouncedSections === sections

  useEffect(() => {

    const zip = new JSZip()
    let imageFilename
    let images = []
    let canvas = document.getElementById('canvas')
    canvas.style.letterSpacing = '3px'
    blocks.forEach((block, index) => {
      let blockSplit = block.split('\n')
      const svgString = `<svg viewBox="0 0 1280 720" width="1280" height="720">
        <text id="line-1" text-anchor="middle" x="640" y="605" font-family="${FONT}" font-size="40.25px" font-style="${FONT_STYLE}" fill="white">
          ${blockSplit[0] || ''}
        </text>
        <text id="line-2" text-anchor="middle" x="640" y="665" font-family="${FONT}" font-size="40.25px" font-style="${FONT_STYLE}" fill="white">
          ${blockSplit[1] || ''}
        </text>
      </svg>`

      const container = document.getElementById('svg-space')
      container.innerHTML = svgString
      const svgEl = container.firstChild
      svgEl.style.letterSpacing = '3px'

      function addTextBackground(textEl) {
        const SVGRect = textEl.getBBox()

        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        rect.setAttribute("x", SVGRect.x - 10)
        rect.setAttribute("y", SVGRect.y)
        rect.setAttribute("width", SVGRect.width + 20)
        rect.setAttribute("height", SVGRect.height)
        rect.setAttribute("fill", "#00000088")
        svgEl.insertBefore(rect, textEl)
      }

      const line1 = svgEl.getElementById('line-1')
      const line2 = svgEl.getElementById('line-2')
      if (background === 'dark') {
        addTextBackground(line1)
        addTextBackground(line2)
      }

      canvg(canvas, container.innerHTML)
      
      images.push({ section: '1', src: canvas.toDataURL() })
      canvas.toBlob(async blob => {
        imageFilename = _sections[index] + '.png'
        zip.file(imageFilename, blob, { base64: true })

        if (index + 1 !== blocks.length) return
        const content = await zip.generateAsync({ type: "blob" })
        setZipHref(window.URL.createObjectURL(content))
      })
    })

    setImages(images)
  }, [debouncedLyrics, debouncedSections, background])

  return (
    <>
      <div style={{ padding: 10 }}>
        <div>
          <div style={{ display: 'none' }}>
            <canvas id="canvas" width="800px" height="600px"/>
          </div>
          <Typography variant="h3" style={{ fontFamily: FONT }}>
            OLGA
          </Typography>
          <Typography style={{ fontFamily: FONT }} gutterBottom>
            Lyrics Generator BETA
          </Typography>
        </div>
        <div style={{ paddingTop: 5 }}>
          <ButtonBase component="a" download={`${title}.zip`} href={zipHref}
            disabled={!ready}
            style={{
              padding: 10,
              backgroundColor: ready ? 'black' : 'gray',
              color: 'white',
              float: 'right '
            }}
          >
            {ready ? "Download Lyrics" : <><CircularProgress size={15} style={{ marginRight: 5, color: 'white' }} /> Generating Images</>}
          </ButtonBase>
        </div>
        <div style={{ paddingTop: 5 }}>
          <TextField 
            variant="outlined"
            label="Song Title - Artist - Album"
            value={title}
            onChange={e => setTitle(e.target.value.toUpperCase())}
            InputLabelProps={{
              style: { fontFamily: FONT }
            }}
            InputProps={{
              style: { fontFamily: FONT }
            }}
            style={{ width: 500 }}
          />
        </div>
        <TextBackgroundToggle
          background={background}
          onChange={v => setBackground(v)}
        />
      </div>
      <div style={{ display: 'flex', paddingLeft: 10, paddingRight: 10 }}>
        <div style={{ flex: '0 0 auto', width: 700, maxHeight: 'calc(100vh - 160px)', overflowY: 'scroll' }}>
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ flex: '0 0 auto', width: 180, paddingRight: 10 }}>
              {_sections.map((item, index) => (
                <div key={index} style={{ height: 85 }}>
                  <TextField 
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    label="Section"
                    value={item}
                    onChange={e => {
                      const value = e.target.value.toUpperCase()
                      const _sections = sections.split('|')
                      _sections[index] = value
                      setSections(_sections.join('|'))
                    }}
                    InputLabelProps={{
                      style: { fontFamily: FONT }
                    }}
                    InputProps={{
                      style: { fontFamily: FONT }
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ flexGrow: 1, paddingRight: 10 }}>
              {blocks.map((block, index) => (
                <div key={index} style={{ height: 85 }}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    rowsMax={10}
                    label="Block"
                    value={block}
                    placeholder="ENTER LYRICS HERE"
                    onChange={e => {
                      const value = e.target.value.toUpperCase()
                      
                      if (!lyrics) {
                        setLyrics(value)
                        
                        return
                      }
                      
                      const lines = value.split('\n')
                      let lyricsSplit = lyrics.split('\n')

                      if (lines.length === 1) {
                        lyricsSplit[2 * index] = lines[0]
                        setLyrics(lyricsSplit.join('\n'))
                        
                        return
                      }

                      if (lines.length > 2) {
                        lyricsSplit[2 * index] = lines[0]
                        lyricsSplit[2 * index + 1] = lines[1]
                        lyricsSplit.splice([2 * index + 2], 0, lines[2])
                        setLyrics(lyricsSplit.join('\n'))
                        
                        return
                      }

                      lyricsSplit[2 * index] = lines[0]
                      lyricsSplit[2 * index + 1] = lines[1]
                      setLyrics(lyricsSplit.join('\n'))
                    }}
                    onKeyDown={e => {
                      // 

                      // console.log(e.target.value === block ? true : false)

                      // if (e.keyCode === 46 && e.target.value === block) {
                      //   let lyricsSplit = lyrics.split('\n')
                      //   lyricsSplit.splice([2 * index + 1], 1)
                      //   setLyrics(lyricsSplit.join('\n'))
                      // }
                    }}
                    InputLabelProps={{
                      style: { fontFamily: FONT }
                    }}
                    InputProps={{
                      style: { fontFamily: FONT }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <main style={{ flexGrow: 1, maxHeight: 'calc(100vh - 160px)', overflowY: 'scroll' }}>
          {images.map((image, index) => (
            <div key={index}>
              <Typography variant="caption" style={{ marginLeft: 10, fontFamily: FONT }}>
                {_sections[index]}
              </Typography>
              <div 
                key={index}
                style={{
                  height: 'auto',
                  minWidth: 100,
                  marginLeft: 10,
                  //background: 'black',
                  background: `url('./preview-bg.png')`,
                  backgroundSize: 'cover',
                }}
              >
                <img alt={image.section} src={image.src} style={{ width: '100%' }} />
              </div>  
            </div>
          ))}
        </main>
      </div>
    </>
  )
}

function TextBackgroundToggle(props) {
  const {
    background = 'dark',
    onChange = () => null,
  } = props

  return (
    <>
      <div
        style={{
          marginTop: 10,
          marginBottom: 10,
          fontSize: 12,
          color: '#00000085',
        }}
      >
        Lyrics Background
      </div>
      <ToggleButtonGroup
        value={background}
        exclusive
        onChange={(e, newVal) => onChange(newVal)}
        size="small"
      >
        <ToggleButton value="dark">
          DARK
        </ToggleButton>
        <ToggleButton value="none">
          NONE
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  )
}

export default LyricsGenerate
