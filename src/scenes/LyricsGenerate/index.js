import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import canvg from 'canvg'
import JSZip from 'jszip'

function LyricsGenerate(props) {
  const [title, setTitle] = useState('')
  const [section, setSection] = useState('')
  const [block, setBlock] = useState('')
  const [imgData, setImgData] = useState()
  const [canvasHref, setCanvasHref] = useState('')
  
  useEffect(() => {
    let blockSplit = block.split('\n')
    const svgString = `<svg width="1280" height="720">
      <text text-anchor="middle" x="640" y="600" font-family="Quicksand" font-size="30pt" font-style="bold" fill="white" letter-spacing="2">
        ${blockSplit[0] || ''}
      </text>
      <text text-anchor="middle" x="640" y="650" font-family="Quicksand" font-size="30pt" font-style="bold" fill="white" letter-spacing="2">
        ${blockSplit[1] || ''}
      </text>
    </svg>`
    
    let canvas = document.createElement('canvas')
    canvg(canvas, svgString)
    setImgData(canvas.toDataURL())
    canvas.toBlob(async blob => {
      const zip = new JSZip()
      let imageFilename
      
      imageFilename = section + '1' + '.png'
      zip.file(imageFilename, blob, { base64: true })
      
      // file names should have unique names to prevent overwrite
      imageFilename = section + '2' + '.png'
      zip.file(imageFilename, blob, { base64: true })
      
      const content = await zip.generateAsync({ type: "blob" })
      setCanvasHref(window.URL.createObjectURL(content))
    })
  }, [block, section])

  return (
    <>
      <div>
        OLGA
      </div>
      <div>
        <a download={`${title}.zip`} href={canvasHref}>SAVE LYRICS</a>
      </div>
      <div>
        <TextField 
          variant="outlined"
          label="Song Title"
          value={title}
          placeholder="WHAT A BEAUTIFUL NAME"
          onChange={e => setTitle(e.target.value.toUpperCase())}
        />
      </div>
      <div style={{ display: 'flex', padding: 10 }}>
        <div style={{ flex: '0 0 auto', minWidth: 700 }}>
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ flex: '0 0 auto', width: 150 }}>
              <TextField 
                variant="outlined"
                fullWidth
                label="Section"
                value={section}
                placeholder="VERSE 1-1"
                onChange={e => setSection(e.target.value.toUpperCase())}
              />
            </div>
            <div style={{ flexGrow: 1 }}>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                rowsMax={10}
                label="Block"
                value={block}
                placeholder="YOU WERE THE WORD AT THE BEGINNING"
                onChange={e => setBlock(e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>
        <main style={{ flexGrow: 1 }}>
          <div 
            style={{
              height: 'auto',
              minWidth: 100,
              border: 'red',
              borderWidth: 2,
              borderStyle: 'solid',
              marginLeft: 10,
              background: 'black',
            }}
          >
            <img alt={section} src={imgData} style={{ width: '100%' }} />
          </div>
        </main>
      </div>
    </>
  )
}

export default LyricsGenerate